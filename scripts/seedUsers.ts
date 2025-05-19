import 'dotenv/config' // ✅ Auto-loads the .env file
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const users = [
  {
    email: "emily.nguyen@example.com",
    password: "test1234",
    first_name: "Emily",
    last_name: "Nguyen",
    phone: "0401000101",
    address: "12 Art Ave, Adelaide",
    role: "user",
  },
  {
    email: "liam.smith@example.com",
    password: "test1234",
    first_name: "Liam",
    last_name: "Smith",
    phone: "0402000202",
    address: "45 Creative St, North Adelaide",
    role: "user",
  },
  {
    email: "ava.chen@example.com",
    password: "test1234",
    first_name: "Ava",
    last_name: "Chen",
    phone: "0403000303",
    address: "77 Paint Dr, Glenelg",
    role: "user",
  },
  {
    email: "noah.brown@example.com",
    password: "test1234",
    first_name: "Noah",
    last_name: "Brown",
    phone: "0404000404",
    address: "90 Sketch Rd, Norwood",
    role: "user",
  },
  {
    email: "isabella.lee@example.com",
    password: "test1234",
    first_name: "Isabella",
    last_name: "Lee",
    phone: "0405000505",
    address: "32 Colour Lane, Adelaide",
    role: "user",
  },
];

async function seedUsers() {
  for (const user of users) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (signUpError || !signUpData?.user) {
      console.error(`❌ Error signing up ${user.email}:`, signUpError?.message);
      continue;
    }

    const userId = signUpData.user.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });

    if (profileError) {
      console.error(`❌ Error inserting profile for ${user.email}:`, profileError.message);
    } else {
      console.log(`✅ Created user + profile for ${user.email}`);
    }
  }
}

seedUsers();
