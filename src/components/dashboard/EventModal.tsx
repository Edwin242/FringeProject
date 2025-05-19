// src/components/dashboard/EventModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as z from 'zod';

// Form schema definition
const eventFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' }),
  schedule: z.date({ required_error: 'Please select a date and time' }),
  capacity: z.coerce
    .number()
    .int()
    .positive({ message: 'Capacity must be at least 1' }),
  category: z.string().min(1, { message: 'Please select a category' }),
  venue_id: z.string().min(1, { message: 'Please select a venue' }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface Event {
  id: string;
  name: string;
  description: string;
  schedule: string;
  capacity: number;
  category: string;
  venue_id: string;
  venue: string;
  date: string;
  image_url?: string[];
}

interface Venue {
  id: string;
  name: string;
}

interface Image {
  file?: File;
  preview: string;
}

const CATEGORIES = [
  'Music',
  'Comedy',
  'Theatre',
  'Dance',
  'Visual Arts',
  'Workshop',
  'Featured',
  'Performance',
  'Exhibition',
  'Social',
  'Demonstration',
];

export default function EventModal({
  onEventAdded,
  onEventUpdated,
  onEventDeleted,
  eventToEdit,
  venues,
}: {
  onEventAdded: (newEvent: Event) => void;
  onEventUpdated: (updatedEvent: Event) => void;
  onEventDeleted?: () => void;
  eventToEdit?: Event | null;
  venues: Venue[];
}) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [eventExists, setEventExists] = useState<boolean | null>(null);

  const isEditMode = !!eventToEdit;

  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      description: '',
      capacity: 100,
      category: '',
      venue_id: '',
      schedule: undefined,
    },
  });

  // Populate form and images when editing, and check event existence
  useEffect(() => {
    const populateForm = async () => {
      if (isEditMode && eventToEdit && open) {
        const { data: freshEvent, error: fetchError } = await supabase
          .from('events')
          .select(
            'id, name, description, schedule, capacity, category, venue_id, image_url'
          )
          .eq('id', eventToEdit.id)
          .single();

        if (fetchError || !freshEvent) {
          console.error('Error fetching event:', fetchError);
          alert('Event not found or you do not have permission to access it.');
          setEventExists(false);
          setOpen(false);
          return;
        }

        setEventExists(true);

        eventForm.reset({
          name: freshEvent.name,
          description: freshEvent.description,
          schedule: new Date(freshEvent.schedule),
          capacity: freshEvent.capacity,
          category: freshEvent.category,
          venue_id: freshEvent.venue_id,
        });

        if (freshEvent.image_url && freshEvent.image_url.length > 0) {
          setImages(
            freshEvent.image_url.map((url) => ({
              preview: url,
            }))
          );
        } else {
          setImages([]);
        }
      } else {
        setEventExists(null);
        eventForm.reset({
          name: '',
          description: '',
          capacity: 100,
          category: '',
          venue_id: '',
          schedule: undefined,
        });
        setImages([]);
      }
    };

    populateForm();
  }, [eventToEdit, isEditMode, open, eventForm]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || images.length >= 3) return;
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setImages((prev) => [...prev, { file, preview: previewUrl }].slice(0, 3));
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleDelete() {
    if (!isEditMode || !eventToEdit) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .match({ id: eventToEdit.id });

    if (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event: ' + error.message);
      return;
    }

    if (eventToEdit.image_url && eventToEdit.image_url.length > 0) {
      const fileNames = eventToEdit.image_url.map((url) => {
        const parts = url.split('/');
        return parts[parts.length - 1];
      });

      const { error: storageError } = await supabase.storage
        .from('event-images')
        .remove(fileNames);

      if (storageError) {
        console.error('Error deleting images:', storageError);
        alert(
          'Event deleted, but failed to delete associated images: ' +
            storageError.message
        );
      }
    }

    onEventDeleted?.();
    setOpen(false);
  }

  async function onSubmit(data: EventFormValues) {
    if (isEditMode && eventExists === false) {
      alert(
        'Cannot update: Event does not exist or you do not have permission.'
      );
      return;
    }

    const imageUrls: string[] = [];

    for (const image of images) {
      if (image.file) {
        const fileName = `${Date.now()}-${image.file.name}`;
        const fileType = image.file.type || 'image/jpeg'; // Fallback
        console.log('Uploading file:', image.file.name, 'Type:', fileType);

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, image.file, {
            contentType: fileType,
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Failed to upload image: ' + uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          imageUrls.push(publicUrlData.publicUrl);
        } else {
          console.error('Failed to get public URL for image:', fileName);
          alert('Failed to retrieve image URL');
          return;
        }
      } else if (image.preview) {
        imageUrls.push(image.preview);
      }
    }

    if (isEditMode && eventToEdit) {
      const updateData = {
        name: data.name,
        description: data.description,
        schedule: data.schedule.toISOString(),
        capacity: data.capacity,
        category: data.category,
        venue_id: data.venue_id,
        image_url: imageUrls,
      };

      const { data: updatedEvent, error: eventError } = await supabase
        .from('events')
        .update(updateData)
        .match({ id: eventToEdit.id })
        .select(
          'id, name, description, schedule, capacity, category, venue_id, image_url, venues(name)'
        )
        .single();

      if (eventError) {
        console.error('Error updating event:', eventError);
        console.error('Error details:', JSON.stringify(eventError, null, 2));
        if (
          eventError.code === 'PGRST116' &&
          eventError.details.includes('0 rows')
        ) {
          alert(
            'Failed to update event: Event not found or you do not have permission to update it.'
          );
        } else {
          alert('Failed to update event: ' + eventError.message);
        }
        return;
      }

      onEventUpdated({
        ...updatedEvent,
        venue: updatedEvent.venues?.name || 'Unknown',
        date: format(new Date(updatedEvent.schedule), 'yyyy-MM-dd'),
      });
    } else {
      const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert({
          name: data.name,
          description: data.description,
          schedule: data.schedule.toISOString(),
          capacity: data.capacity,
          category: data.category,
          venue_id: data.venue_id,
          image_url: imageUrls,
        })
        .select(
          'id, name, description, schedule, capacity, category, venue_id, image_url, venues(name)'
        )
        .single();

      if (eventError) {
        console.error('Error creating event:', eventError);
        alert('Failed to create event');
        return;
      }

      onEventAdded({
        ...newEvent,
        venue: newEvent.venues?.name || 'Unknown',
        date: format(new Date(newEvent.schedule), 'yyyy-MM-dd'),
      });
    }

    setOpen(false);
    eventForm.reset();
    setImages([]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pink-600 text-white hover:bg-pink-700">
          <Plus className="mr-2 h-4 w-4" />
          {isEditMode ? 'Edit Event' : 'Add Event'}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-gray-800 bg-gray-900 p-6 text-white sm:max-w-[600px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <Form {...eventForm}>
            <form
              onSubmit={eventForm.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={eventForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Event Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter event name"
                        {...field}
                        className="border-gray-800 bg-gray-900 text-white focus:border-pink-500 focus:ring-pink-500"
                      />
                    </FormControl>
                    <FormMessage className="text-pink-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={eventForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter event description"
                        {...field}
                        className="min-h-[100px] border-gray-800 bg-gray-900 text-white focus:border-pink-500 focus:ring-pink-500"
                      />
                    </FormControl>
                    <FormMessage className="text-pink-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={eventForm.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-gray-300">Schedule</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full border-gray-800 bg-gray-900 pl-3 text-left font-normal text-white hover:bg-gray-800 focus:border-pink-500 focus:ring-pink-500',
                                !field.value && 'text-gray-400'
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP 'at' h:mm a")
                              ) : (
                                <span>Select date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto border-gray-800 bg-gray-900 p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="border-none bg-gray-900 text-white"
                          />
                          <div className="border-t border-gray-800 p-3">
                            <Input
                              type="time"
                              className="border-gray-800 bg-gray-900 text-white focus:border-pink-500 focus:ring-pink-500"
                              onChange={(e) => {
                                const date = new Date(
                                  field.value || new Date()
                                );
                                const [hours, minutes] =
                                  e.target.value.split(':');
                                date.setHours(Number.parseInt(hours));
                                date.setMinutes(Number.parseInt(minutes));
                                field.onChange(date);
                              }}
                              value={
                                field.value
                                  ? `${field.value
                                      .getHours()
                                      .toString()
                                      .padStart(2, '0')}:${field.value
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, '0')}`
                                  : ''
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-pink-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          className="border-gray-800 bg-gray-900 text-white focus:border-pink-500 focus:ring-pink-500"
                        />
                      </FormControl>
                      <FormMessage className="text-pink-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={eventForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-800 bg-gray-900 text-white focus:border-pink-500 focus:ring-pink-500">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-gray-800 bg-gray-900 text-white">
                          {CATEGORIES.map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="text-white hover:bg-pink-600 hover:text-white focus:bg-gray-800"
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-pink-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="venue_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Venue</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-800 bg-gray-900 text-white focus:border-pink-500 focus:ring-pink-500">
                            <SelectValue placeholder="Select venue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-gray-800 bg-gray-900 text-white">
                          {venues.map((venue) => (
                            <SelectItem
                              key={venue.id}
                              value={venue.id}
                              className="text-white hover:bg-pink-600 hover:text-white focus:bg-gray-800"
                            >
                              {venue.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-pink-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="mb-3 text-lg font-medium text-white">
                    Event Images
                  </h3>
                  <p className="mb-4 text-sm text-gray-400">
                    Upload up to 3 images for this event
                  </p>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-32 overflow-hidden rounded-md border border-gray-800"
                      >
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 bg-red-600 hover:bg-red-700"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {images.length < 3 && (
                      <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-gray-800 transition-colors hover:border-gray-700">
                        <label
                          htmlFor="image-upload"
                          className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
                        >
                          <Plus className="mb-2 h-6 w-6 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            Add Image
                          </span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-2 flex justify-between gap-3 pt-4">
                <div className="flex space-x-2">
                  {isEditMode && (
                    <Button
                      variant="outline"
                      className="border-red-800/30 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                      onClick={handleDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-pink-600 text-white hover:bg-pink-700"
                  >
                    {isEditMode ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
