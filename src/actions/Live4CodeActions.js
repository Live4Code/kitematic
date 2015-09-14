import alt from '../alt';
import live4code from '../utils/Live4CodeUtil';

class AccountActions {
  login (code) {
    this.dispatch({});
    live4code.login(code);
  }

  logout () {
    this.dispatch({});
    live4code.logout();
  }
}

export default alt.createActions(AccountActions);
