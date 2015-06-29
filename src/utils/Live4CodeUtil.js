import util from './Util';
import resources from './ResourcesUtil';

export default  {
  addHostEntry (ip) {
    if(util.isWindows()) {
      console.log('dose not support windows right now');
      return;
    } else {
      var cmd = "sed '/.*live4code.com/d' /etc/hosts > /tmp/hosts && " +
        'cp /tmp/hosts /etc/hosts && ' +
        'echo '+ip+' www.live4code.com >> /etc/hosts';
      return cmd;
    }
  },

  containerConfig (containerData) {
    //init container to set up necessary containers through dockerode
    if (containerData.Image.indexOf('dspfac/runnertaskserver:init') !== -1){
      containerData.Binds =  containerData.Binds || [];
      //it requires docker.sock to use dockerode
      containerData.Binds.push("/var/run/docker.sock:/tmp/docker.sock");
    }
    return containerData;
  },

  macSudoCmd (cmd) {
    return `${util.escapePath(resources.macsudo())} -p "Live4Code requires administrative privileges to add www.live4code.com to /etc/hosts." sh -c \"${cmd}\"`;
  }

};