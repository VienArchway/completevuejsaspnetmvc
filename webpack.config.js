const path = require("path");
const glob = require("glob");
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const babelLoaderOptions = {
    presets: [
        ["@babel/preset-env", {
            "targets": { "ie": 11 },
            "useBuiltIns": false
        }]
    ]
};

const styleOptimization = {
    minimizer: [
        new UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: true // set to true if you want JS source maps
        }),
        new OptimizeCSSAssetsPlugin({})
    ]
};

const viewEntiries = glob.sync(path.join(__dirname, "./ClientSrc/views/**/index.js")).reduce((p, c) => {
    let key = c.substr(path.join(__dirname, "./ClientSrc/views/").length);
    key = key.substr(0, key.length - "/index.js".length);
    p[key] = c;
    return p;
}, {});

const viewStyleEntiries = glob.sync(path.join(__dirname, "./ClientSrc/views/**/index.scss")).reduce((p, c) => {
    let key = c.substr(path.join(__dirname, "./ClientSrc/views/").length);
    key = key.substr(0, key.length - "/index.scss".length);
    p[key] = c;
    return p;
}, {});

module.exports = (_, argv) => {

    const devMode = argv.mode !== "production";

    const lib = {
        entry: "./ClientSrc/lib/script/index.js",
        output: {
            path: `${__dirname}/wwwroot/resources/lib`,
            filename: "lib.js"
        },
        resolve: {
            alias: {
                vue: devMode ? "vue/dist/vue.js" : "vue/dist/vue.min.js"
            }
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: babelLoaderOptions
                    }
                }
            ]
        }
    };

    const view = !Object.keys(viewEntiries).length ? null : {
        entry: viewEntiries,
        output: {
            path: `${__dirname}/wwwroot/resources/views`,
            filename: "[name]/index.js"
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        "vue-style-loader",
                        "css-loader",
                        "sass-loader"
                    ]
                },
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                    options: {
                        loaders: {
                            "scss": [
                                "vue-style-loader",
                                "css-loader",
                                "sass-loader"
                            ]
                        }
                    }
                }, {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: babelLoaderOptions
                    }
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin()
        ],
    };

    const libStyle = {
        entry: "./ClientSrc/lib/style/index.scss",
        output: {
            path: path.join(__dirname, "./wwwroot/resources/lib")
        },
        plugins: [
            new FixStyleOnlyEntriesPlugin(),
            new MiniCssExtractPlugin({
                filename: "lib.css"
            })
        ],
        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader",
                    ],
                },
                {
                    test: /fa\-.+?\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                    use: [{
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "fonts/"
                        }
                    }]
                }
            ]
        }
    };

    const viewStyle = !Object.keys(viewStyleEntiries).length ? null : {
        entry: viewStyleEntiries,
        output: {
            path: path.join(__dirname, "./wwwroot/resources/views")
        },
        plugins: [
            new FixStyleOnlyEntriesPlugin(),
            new MiniCssExtractPlugin({
                filename: "[name]/index.css"
            })
        ],
        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader",
                    ],
                }
            ]
        }
    };

    if(!devMode) {
        (libStyle || {}).optimization = styleOptimization;
        (viewStyle || {}).optimization = styleOptimization;
    }

    return [lib, view, libStyle, viewStyle].filter(t => !!t);
};
