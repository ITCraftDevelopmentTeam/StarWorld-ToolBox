const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const isProduction = process.env.NODE_ENV === "production";
const webpack = require("webpack");
const fs = require("memory-fs");

const stylesHandler = "style-loader";

const webpackPlugins = [
    new HtmlWebpackPlugin(
        {
            template: "src/index.html",
        }
    ),
    new MiniCSSExtractPlugin(
        {
            filename: '[name].css',
            chunkFilename: "[id].css"
        }
    ),
    new webpack["ProvidePlugin"](
        {
            $: 'jquery',
            jquery: 'jquery',
            jQuery: 'jquery',
            Buffer: ["buffer", "Buffer"],
            process: 'process/browser',
        }
    ),
    new webpack["DefinePlugin"](
        {
            "process.env": {
                NODE_ENV: process.env.NODE_ENV,
            },
        }
    ),
];

const config = {
    entry: "./src/scripts/index.ts",
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.rxml']
    },
    externals: {},
    performance: {
        hints: false,
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].[hash].js",
    },
    devServer: {
        open: true,
        host: "localhost",
    },
    optimization: {
        minimize : true,
        nodeEnv: false
    },
    plugins: webpackPlugins,
    module: {
        rules: [
            {
              test: /\.(rxml)$/i,
              type: "asset/source",
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.(ts|tsx)$/i,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(js|jsx)$/i,
                loader: "babel-loader",
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCSSExtractPlugin.loader, 'css-loader', "postcss-loader", "sass-loader"]
            },
            {
                test: /\.css$/i,
                use: [stylesHandler, "css-loader", "postcss-loader"],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: "asset",
            },
        ],
    },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
