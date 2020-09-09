module.exports = shipit => {
    require('shipit-deploy')(shipit);
    require('shipit-shared')(shipit);
  
    const appName = 'demo-server';
  
    shipit.initConfig({
      default: {
        deployTo: '/home/ibaraness/server',
        repositoryUrl: 'https://github.com/ibaraness/demo-server.git',
        keepReleases: 5,
        shared: {
          overwrite: true,
          dirs: ['node_modules']
        }
      },
      production1: {
        servers: [
          {
            host: '192.168.230.100',
            user: 'ibaraness'
          }
        ]
      },
      production2: {
        servers: [
          {
            host: '192.168.230.101',
            user: 'ibaraness'
          }
        ]
      }
    });
  
    const path = require('path');
    const ecosystemFilePath = path.join(
      shipit.config.deployTo,
      'shared',
      'ecosystem.config.js'
    );
  
    // Our listeners and tasks will go here
    shipit.on('updated', () => {
        shipit.start('npm-install', 'copy-config');
    });
      
    shipit.on('published', () => {
      shipit.start('pm2-server');
    });

    shipit.blTask('copy-config', async () => {
      const fs = require('fs');

      const ecosystem = `
      module.exports = {
        apps:[
          {
            name: '${appName}',
            script: '${shipit.releasePath}/src/app/app.js',
            watch: true,
            autostart: true,
            restart_delay: 1000,
            env: {
              NODE_ENV: 'development'
            },
            env_production: {
              NODE_ENV: 'production'
            }
          }
        ]
      };`;
      fs.writeFileSync('ecosystem.config.js', ecosystem, function(err){
        if(err) throw err;
        console.log('File created successfully!');
      });

      await shipit.copyToRemote('ecosystem.config.js', ecosystemFilePath);
    });

    shipit.blTask('npm-install', async () => {
      shipit.remote(`cd ${shipit.releasePath} && npm install --production`);
    });

    shipit.blTask('pm2-server', async ()=>{
      await shipit.remote(`pm2 delete -s ${appName} || :`);
      await shipit.remote(
        `pm2 start ${ecosystemFilePath} --env production --watch true`
      );
      await shipit.remote('pm2 save');
      // Add pm2 save later - to it will run on start
    })
  
  };