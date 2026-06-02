const React = require('react');

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { width: 390, height: 844, x: 0, y: 0 };

const SafeAreaProvider = ({ children }) => React.createElement(React.Fragment, null, children);
const SafeAreaView = ({ children, ...props }) => React.createElement('View', props, children);
const useSafeAreaInsets = () => insets;
const useSafeAreaFrame = () => frame;
const SafeAreaInsetsContext = React.createContext(insets);
const SafeAreaFrameContext = React.createContext(frame);
const initialWindowMetrics = { insets, frame };
const initialSafeAreaInsets = insets;

exports.SafeAreaProvider = SafeAreaProvider;
exports.SafeAreaView = SafeAreaView;
exports.useSafeAreaInsets = useSafeAreaInsets;
exports.useSafeAreaFrame = useSafeAreaFrame;
exports.SafeAreaInsetsContext = SafeAreaInsetsContext;
exports.SafeAreaFrameContext = SafeAreaFrameContext;
exports.initialWindowMetrics = initialWindowMetrics;
exports.initialSafeAreaInsets = initialSafeAreaInsets;
exports.default = {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  initialWindowMetrics,
  initialSafeAreaInsets,
};
