import * as React from 'react';
import * as PropTypes from 'prop-types';
import { StateContainer } from '../../core/State';

export interface StateProviderProps {
  state: StateContainer;
}

export class StateProvider extends React.Component<StateProviderProps> {
  static childContextTypes = {
    state: PropTypes.object
  };

  private unsubscribe: () => void;

  getChildContext() {
    return { state: this.props.state };
  }

  componentDidMount() {
    this.unsubscribe = this.props.state.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
