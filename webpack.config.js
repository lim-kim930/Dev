/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: "./src/index.ts",
        redirect: "./src/redirect.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "./js/[name].js"
    },
    mode: process.env.NODE_ENV ? "development" : "production",
    // devtool: 'eval-source-map',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node-moudles/
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, {
                    loader: "css-loader",
                    options: {
                        url: false
                    }
                }],
                exclude: /node-moudles/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            template: "./public/index.html",
            chunks: ["index"]
        }),
        new HTMLWebpackPlugin({
            filename: 'redirect.html',
            template: './public/redirect.html',
            inject: "body",
            chunks: ["redirect"]
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].css"
        }),
        new CSSMinimizerPlugin(),
        new NodePolyfillPlugin(),
        new CopyPlugin({
            patterns: [
                // { from: "public/redirect.html", to: "redirect.html" },
                { from: "src/assets/images/expand.svg", to: "images/expand.svg" },
                { from: "src/assets/images/loading.svg", to: "images/loading.svg" }
            ],
        })
    ],
    resolve: {
        extensions: [".ts", "..."],
        fallback: { "crypto": require.resolve("crypto-browserify") }
    }
};