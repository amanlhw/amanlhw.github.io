module.exports = {
  transpileDependencies: [],
  publicPath: './',
  outputDir: 'docs',
  indexPath: 'index.html',
  chainWebpack: config => {
    // 确保HTML模板被正确处理
    config
      .plugin('html')
      .tap(args => {
        args[0].template = './index.html'
        args[0].title = '叮咚的工具箱'
        return args
      })
  }
} 