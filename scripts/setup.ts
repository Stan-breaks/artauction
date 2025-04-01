import { mkdir } from 'fs/promises';
import { join } from 'path';

async function setup() {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsPath = join(process.cwd(), 'public/uploads');
    await mkdir(uploadsPath, { recursive: true });
    console.log('Created uploads directory:', uploadsPath);

    console.log('Setup completed successfully');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setup(); 