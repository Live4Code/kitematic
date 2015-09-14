import  _ from 'underscore';
import util from './Util';
import resources from './ResourcesUtil';
import hub from './HubUtil';
import request from 'request';
import machine from './DockerMachineUtil';
import docker from './DockerUtil';
import accountServerActions from '../actions/AccountServerActions';
import path from 'path';
import mkdirp from 'mkdirp';

export default  {

  login (code, callback) {
    var self = this;
    request.post('http://www.live4code.com/api/kitematic/code', {form: {code: code}}, (error, response, body) => {
      if (error) {
        accountServerActions.errors({errors: {detail: error.message}});
        if (callback) { callback(error); }
        return;
      }
      let data = JSON.parse(body);

      if (response.statusCode === 200) {
        if (data.username){
          localStorage.setItem('live4code.username', data.username);
          if(data.env){
            localStorage.setItem('live4code.env', data.env);
          }
          machine.ip().then(ip => {
            localStorage.setItem('live4code.machineIP', ip);
            hub.login('live4codekitematic','kitematic', function(err, ok){
              self.startInitContainer();
            });
          });
        } else {
          accountServerActions.errors({errors: {detail: 'Invalid Code'}});
          if (callback) { callback(new Error('Invalid code')); }
        }
      } else {
        accountServerActions.errors({errors: {detail: data.message}});
        if (callback) { callback(new Error(data.message)); }
      }
    });
  },

  logout () {
    localStorage.removeItem('live4code.username');
    hub.logout();
  },

  addHostEntry (ip) {
    if(util.isWindows()) {
      console.log('dose not support windows right now');
      return;
    } else {
      var cmd = "sed '/.*local.live4code.com/d' /etc/hosts > /tmp/hosts && " +
        'cp /tmp/hosts /etc/hosts && ' +
        'echo '+ip+' meticulous-dft.local.live4code.com >> /etc/hosts';
      return cmd;
    }
  },

  startInitContainer () {
    let existing = docker.client.getContainer('runnertaskserver');
    existing.inspect(function(err, data){
      if (!data){
        docker.run('init', 'dspfac/runnertaskserver', 'init');
      }
    });
  },

  containerConfig (containerData) {
    //init container to set up necessary containers through dockerode
    if (containerData.Image.indexOf('dspfac/runnertaskserver:init') !== -1){
      containerData.Binds =  containerData.Binds || [];
      //it requires docker.sock to use dockerode
      containerData.Binds.push("/var/run/docker.sock:/tmp/docker.sock");
      //add queue name
      containerData.Env = containerData.Env || [];
      containerData.Env.push('KUE_QUEUE='+localStorage.getItem('live4code.username'));
      containerData.Env.push('MACHINE_IP='+localStorage.getItem('live4code.machineIP'));
      var hostVolume = util.escapePath(path.join(util.home(), util.documents(), 'Kitematic', 'uservolume'));
      mkdirp(hostVolume, function (err) {
        console.log(err);
      });
      containerData.Env.push('HOST_VOLUME='+hostVolume);
      let env = localStorage.getItem('live4code.env');
      if (env) {
        containerData.Env.push.apply(containerData.Env, env.split(';'));
      }
    }
    return containerData;
  },

  macSudoCmd (cmd) {
    return `${util.escapePath(resources.macsudo())} -p "Live4Code requires administrative privileges to add www.live4code.com to /etc/hosts." sh -c \"${cmd}\"`;
  }

};
