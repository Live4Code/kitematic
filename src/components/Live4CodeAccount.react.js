var _ = require('underscore');
var React = require('react/addons');
var Router = require('react-router');
var RetinaImage = require('react-retina-image');
var Header = require('./Header.react');
var metrics = require('../utils/MetricsUtil');
var accountStore = require('../stores/AccountStore');
var accountActions = require('../actions/AccountActions');
var containerStore = require('../stores/ContainerStore');
var containerActions = require('../actions/ContainerActions');

module.exports = React.createClass({
  mixins: [Router.Navigation],

  getInitialState: function () {
    return accountStore.getState();
  },

  componentDidMount: function () {
    document.addEventListener('keyup', this.handleDocumentKeyUp, false);
    accountStore.listen(this.update);
  },

  componentWillUnmount: function () {
    document.removeEventListener('keyup', this.handleDocumentKeyUp, false);
    accountStore.unlisten(this.update);
  },

  componentWillUpdate: function (nextProps, nextState) {
    if (nextState.username){
      let name = 'runnertaskserver';
      this.transitionTo('containerHome', {name});
    }
  },

  update: function () {
    this.setState(accountStore.getState());
  },

  render: function () {
    return (
      <div className="setup">
        <Header hideLogin={true}/>
        <div className="setup-content">
          {close}
          <div className="form-section">
            <RetinaImage src={'connect-to-hub.png'} checkIfRetinaImgExists={false}/>
            <Router.RouteHandler errors={this.state.errors} loading={this.state.loading} {...this.props}/>
          </div>
          <div className="desc">
            <div className="content">
              <h1>Connect to Docker Hub</h1>
              <p>Pull and run private Docker Hub images by connecting your Docker Hub account to Kitematic.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
