// src/components/dashboard/SystemConfigContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Save, X } from 'lucide-react';

interface Config {
  id: string;
  config_name: string;
  config_value: string;
  description: string;
}

export default function SystemConfigContent() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Fetch system configurations on mount
  useEffect(() => {
    const fetchConfigs = async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('id, config_name, config_value, description');

      if (error) {
        console.error('Error fetching system configs:', error);
        return;
      }

      setConfigs(data || []);
    };

    fetchConfigs();
  }, []);

  const handleEdit = (config: Config) => {
    setEditingId(config.id);
    setEditValue(config.config_value);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from('system_config')
      .update({ config_value: editValue })
      .eq('id', id);

    if (error) {
      console.error('Error updating config:', error);
      alert('Failed to update configuration');
      return;
    }

    setConfigs((prev) =>
      prev.map((config) =>
        config.id === id ? { ...config, config_value: editValue } : config
      )
    );
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">System Configuration</h2>

      <div className="rounded-md border border-gray-800 bg-gray-900">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-800">
              <TableHead className="text-gray-400">Config Name</TableHead>
              <TableHead className="text-gray-400">Value</TableHead>
              <TableHead className="text-gray-400">Description</TableHead>
              <TableHead className="text-right text-gray-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((config) => (
              <TableRow
                key={config.id}
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <TableCell className="text-white">
                  {config.config_name}
                </TableCell>
                <TableCell>
                  {editingId === config.id ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="border-gray-700 bg-gray-800 text-white"
                    />
                  ) : (
                    <span className="text-gray-300">{config.config_value}</span>
                  )}
                </TableCell>
                <TableCell className="text-gray-400">
                  {config.description}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === config.id ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(config.id)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(config)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
