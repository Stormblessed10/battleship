const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
let mode = process.env.NODE_ENV === "production"? "production" : "development";
module.exports = {

  entry: "./src/js/controller.js",

  mode: mode,

  module: {
    rules: [
        {
            test: /\.(pgn|jpe?g|svg|gif)$/i,
            type: 'asset/resources',
        },
        {
            test: /\.s?css$/i,
            use: [
              {
              loader: MiniCssExtractPlugin.loader,
              options: { publicPath: ""}

              },
              "css-loader", 
              "postcss-loader", 
              "sass-loader"
            ]
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
            },
        },
    ],
  },

  plugins: [new MiniCssExtractPlugin()],

  devtool: "source-map",

  devServer: {
    static: {
        directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
    liveReload: true,
  },

  target: "web",
};
