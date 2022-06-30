const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    // mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node-moudles/
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            title: "测试6666"
        })
    ]
}