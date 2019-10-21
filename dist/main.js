const program = require('commander')
program.version('1.0.0')
.usage('<command> [options]')
.command('add', 'add a new template')
.command('delete', 'delete a template')
.command('list', 'list all the templates')
.command('init', 'generate a new project from a template')

program.parse(process.argv)

// 交互式命令行
const inquirer = require('inquirer')
// 修改控制台字符串样式
const chalk = require('chalk')
const fs = require('fs')
// 读取根目录下的template.json
const tplObj = require(`${__dirname}/../template`)
// 自定义交互式命令行的问题及简单的校验
let question = [
  {
    name: 'name',
    type: 'input',
    message: '请输入模板名称',
    validate (val) {
      if(val === '') {
        return 'Name is required'
      } else if(tplObj[val]) {
        return 'Template has already existed'
      } else {
        return true
      }
    }
  },
  {
    name: 'url',
    input: 'input',
    message: '请输入模板地址',
    validate (val) {
      if(val === '') return 'The url is required'
      return true
    } 
  }
]
inquirer.prompt(question).then(answers => {
  // answers 为用户输入的内容，是一个对象
  let {name, url} = answers
  // 过滤unicode 字符
  tplObj[name] = url.replace(/[\u0000-\u0019]/g, '')
  // 把模板信息写入 template.json 文件中
  fs.writeFile(`${__dirname}/../template.json`, JSON.stringify(tplObj), 'utf-8', err => {
    if(err) console.log(err)
    console.log('\n')
    console.log(chalk.green('Added successfully!\n'))
      console.log(chalk.grey('The latest template list is: \n'))
      console.log(tplObj)
      console.log('\n')
  })
})


const program = require('commander')
const chalk = require('chalk')
const ora = require('ora')
const download = require('download-git-repo')
const tplObj = require(`${__dirname}/../template`)

program.usage('<template-name> [project-name]')
.program.parse(process.argv)
// 当没有输入参数时给提示
if(program.args.length < 1) return program.help()
// 好比 vue init webpack project-name 的命令一样，第一个参数是 webpack，第二个参数是 project-name
let templateName = program.args[0]
let projectName = program.args[1]
if(!tplObj[templateName]) {
  console.log(chalk.red('\n Template does not exit! \n'))
  return
}
if(!projectName) {
  console.log(chalk.red('\n Project should not be empty! \n'))
  return
}
let url = tplObj[templateName]
console.log(chalk.white('\n Start generating... \n'))
// 出现加载图标
const spinner = ora("Downloading...");
spinner.start();
// 执行下载方法并传入参数
download (
  url,
  projectName,
  err => {
    if (err) {
      spinner.fail();
      console.log(chalk.red(`Generation failed. ${err}`))
      return
    }
    // 结束加载图标
    spinner.succeed();
    console.log(chalk.green('\n Generation completed!'))
    console.log('\n To get started')
    console.log(`\n    cd ${projectName} \n`)
  }
)


