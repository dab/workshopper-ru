const tmenu        = require('terminal-menu')
    , path         = require('path')
    , fs           = require('fs')
    , xtend        = require('xtend')
    , EventEmitter = require('events').EventEmitter
    , chalk        = require('chalk')

const util         = require('./util')


function showMenu (opts) {
  var emitter  = new EventEmitter()
    , menu     = tmenu(xtend({
          width : opts.width
        , x     : 3
        , y     : 2
      }, opts.menu))

  menu.reset()
  menu.write(chalk.bold(opts.title) + '\n')
  if (typeof opts.subtitle == 'string')
    menu.write(chalk.italic(opts.subtitle) + '\n')
  menu.write(util.repeat('\u2500', opts.width) + '\n')
    
  opts.exercises.forEach(function (name) {
    var isDone = opts.completed.indexOf(name) >= 0
      , m      = '[Выполнено]'

    name = name

    if (isDone) {
      menu.add(chalk.bold('»') + ' ' + name + util.repeat(' ', opts.width - m.length - name.length - 2) + m)
    } else {
      menu.add(chalk.bold('»') + ' ' + name + util.repeat(' ', opts.width - name.length - 2))
    }
  })

  menu.write(util.repeat('\u2500', opts.width) + '\n')
  menu.add(chalk.bold('Помощь'))

  if (opts.extras) {
    opts.extras.forEach(function (extra) {
      menu.add(chalk.bold(extra))
    })
  }

  menu.add(chalk.bold('Выход'))

  menu.on('select', function (label) {
    var name = chalk.stripColor(label)
                .replace(/(^»?\s+)|(\s+(\[Выполнено\])?$)/g, '')

    menu.y = 0
    menu.reset()
    menu.close()

    if (name === 'Выход')
      return emitter.emit('exit')

    if (name === 'Помощь')
      return emitter.emit('help')

    if (opts.extras && opts.extras.indexOf(name.toLowerCase()) != -1)
      return emitter.emit('extra-' + name.toLowerCase())

    emitter.emit('select', name)
  })

  menu.createStream().pipe(process.stdout)
  
  return emitter
}


module.exports = showMenu
