// Dummy users
const users = [
  {
    phone: "1234567890",
    password: "studentpass",
    role: "student",
    name: "Student User"
  },
  {
    phone: "9876543210",
    password: "adminpass",
    role: "admin",
    name: "Admin User"
  }
];

export async function POST(request) {
  try {
    const { phone, password } = await request.json();
    const user = users.find(
      (u) => u.phone === phone && u.password === password
    );
    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid phone or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        message: "Login successful",
        role: user.role,
        name: user.name,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
} 