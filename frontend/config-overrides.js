// Resolves issues with symlinking
// see https://github.com/facebook/create-react-app/issues/3547#issuecomment-549372163
module.exports = (config, ...rest) => {
    return { ...config, resolve: { ...config.resolve, symlinks: false } };
};
