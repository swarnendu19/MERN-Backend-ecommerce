import { exec } from 'child_process';

// Dynamically import the ecosystem config
import('./ecosystem.config.mjs').then(config => {
  const { apps } = config.default;

  apps.forEach(app => {
    // Set the environment variables
    const env = app.env_production.NODE_ENV === 'production' ? 'production' : 'development';

    // Build the command to start each app
    const command = `pm2 start ${app.script} --name ${app.name} --instances ${app.instances} --exec-mode ${app.exec_mode} --env ${env}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting app: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Stdout: ${stdout}`);
    });
  });
});
