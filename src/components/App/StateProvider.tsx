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

export function connect<K extends {}, OriginalProps extends {}>(
  mapStateToProps: (state: StateContainer, ownProps: OriginalProps) => K
) {
  return function withState(
    WrappedComponent: React.ComponentType<OriginalProps & K>
  ) {
    interface WithStateContext {
      state: StateContainer;
    }

    class WithState extends React.Component<OriginalProps> {
      static contextTypes = {
        state: PropTypes.object
      };

      context: WithStateContext;

      render() {
        const injectedProps = mapStateToProps(this.context.state, this.props);

        return (
          <WrappedComponent
            {...this.props}
            {...injectedProps}
          />
        );
      }
    }

    return WithState;
  };
}