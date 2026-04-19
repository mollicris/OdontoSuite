const http = require('http');

// Mock user database
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
  },
  {
    id: '2',
    email: 'admin@odontosuite.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
  },
];

// Generate mock JWT token
function generateToken() {
  return 'mock_jwt_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
}

// Create server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse request body
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    // Route: POST /auth/login
    if (req.method === 'POST' && req.url === '/auth/login') {
      try {
        const { email, password } = JSON.parse(body);

        // Buscar usuario
        const user = mockUsers.find((u) => u.email === email && u.password === password);

        if (!user) {
          res.writeHead(401);
          res.end(
            JSON.stringify({
              statusCode: 401,
              message: 'Email o contraseña incorrectos',
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        // Generar token
        const token = generateToken();

        // Retornar respuesta exitosa
        res.writeHead(200);
        res.end(
          JSON.stringify({
            statusCode: 200,
            message: 'Inicio de sesión exitoso',
            data: {
              accessToken: token,
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
              },
            },
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            statusCode: 400,
            message: 'Solicitud inválida',
            timestamp: new Date().toISOString(),
          })
        );
      }
      return;
    }

    // Route: POST /auth/me (get current user)
    if (req.method === 'POST' && req.url === '/auth/me') {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token || !token.startsWith('mock_jwt_')) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            statusCode: 401,
            message: 'Token inválido',
            timestamp: new Date().toISOString(),
          })
        );
        return;
      }

      // Return mock user
      res.writeHead(200);
      res.end(
        JSON.stringify({
          statusCode: 200,
          message: 'Usuario obtenido',
          data: mockUsers[0],
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // Default 404
    res.writeHead(404);
    res.end(
      JSON.stringify({
        statusCode: 404,
        message: 'Ruta no encontrada',
        timestamp: new Date().toISOString(),
      })
    );
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🎭 Mock Server corriendo en http://localhost:${PORT}`);
  console.log('\n📝 Credenciales de prueba:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
  console.log('\n   O');
  console.log('   Email: admin@odontosuite.com');
  console.log('   Password: admin123');
  console.log('\n⚠️  Este es un servidor MOCK para desarrollo. NO usar en producción.\n');
});
