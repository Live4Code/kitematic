var _ = require('underscore');
var React = require('react/addons');
var Router = require('react-router');
var validator = require('validator');
var live4codeActions = require('../actions/Live4CodeActions');
var metrics = require('../utils/MetricsUtil');
var shell = require('shell');

module.exports = React.createClass({
  mixins: [Router.Navigation, React.addons.LinkedStateMixin],

  getInitialState: function () {
    return {
      code: '',
      username: '',
      password: '',
      errors: {}
    };
  },

  componentDidMount: function () {
    React.findDOMNode(this.refs.codeInput).focus();
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({errors: nextProps.errors});
  },

  validate: function () {
    let errors = {};
    if (!validator.isLowercase(this.state.code) || !validator.isAlphanumeric(this.state.code) || !validator.isLength(this.state.code, 4, 4)) {
      errors.code = 'Must be 4 lower case letters or numbers';
    }
    return errors;
  },

  handleBlur: function () {
    this.setState({errors: _.omit(this.validate(), (val, key) => !this.state[key].length)});
  },

  handleLogin: function () {
    let errors = this.validate();
    this.setState({errors});

    if (_.isEmpty(errors)) {
      live4codeActions.login(this.state.code);
      metrics.track('Clicked Log In');
    }
  },

  render: function () {
    let loading = this.props.loading ? <div className="spinner la-ball-clip-rotate la-dark"><div></div></div> : null;
    return (
      <form className="form-connect">
        <input ref="codeInput" maxLength="30" name="code" placeholder="Enter activation code" type="text" disabled={this.props.loading} valueLink={this.linkState('code')} onBlur={this.handleBlur}/>
        <p className="error-message">{this.state.errors.code}</p>
        <p className="error-message">{this.state.errors.detail}</p>
        <div className="submit">
          {loading}
          <button className="btn btn-action" disabled={this.props.loading} onClick={this.handleLogin} type="submit">Log In</button>
        </div>
      </form>
    );
  }
});
