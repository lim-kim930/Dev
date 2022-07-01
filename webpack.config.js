const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "./js/bundle.js"
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node-moudles/
            },
            // {
            //     test:/\.(eot|ttf|svg|woff)$/,
            //     exclude: /node-moudles/,
            //     use:{
            //         loader: "file-loader",
            //         options: {
            //             name: "./[name].[ext]"
            //         }
            //     }
            // },
            {
				test:/\.css$/,
				use:[MiniCssExtractPlugin.loader, "css-loader"],
                exclude: /node-moudles/
			}
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            // title: "测试",
            template: "./public/index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].css"
        }),
        new CSSMinimizerPlugin()
    ],
    resolve: {
        extensions: [".ts", "..."]
    }
}