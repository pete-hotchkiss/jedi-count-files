var fs = require('fs')
var path = require('path')

module.exports = count

function count (dir, opts, cb) {
  if (typeof opts === 'function') return count(dir, {}, opts)
  opts = opts || {}
  if (!opts.ignore) opts.ignore = function () { return false }
  var totalStats = {
    files: 0,
    dirs: 0,
    bytes: 0,
    filtered: 0,
  }
  var cnt = 0;

  fs.readdir(dir, function (err, list) {
    if (err) return cb(err)

    var pending = list.length
    if (!pending) return cb(null, totalStats)
    list.forEach(function (file) {

      file = path.resolve(dir, file)

      if (opts.ignore(file)) {

        // cnt += 1;
        totalStats.filtered += 1;
        if (!--pending) cb(null, totalStats)
        return
      }

      fs.stat(file, function (err, stat) {


        if (err) return cb(err)
        if (stat && stat.isDirectory()) {
          totalStats.dirs++

          count(file, opts, function (err, stats) {

            if (err) return cb(err)

            totalStats.files += stats.files
            totalStats.dirs += stats.dirs
            totalStats.bytes += stats.size
            totalStats.filtered += stats.filtered
            if (!--pending) cb(null, totalStats)

          })

        } else {
          totalStats.files++
          if (stat) totalStats.bytes += stat.size
          if (!--pending) cb(null, totalStats)
        }

      })
    })
  })

  return totalStats
}
