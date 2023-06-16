Array.prototype.pushSorted = function(el, compareFn) {
    let index = (function(arr) {
        var start = 0
        var end = arr.length - 1
        while (start <= end) {
            var middle = (end + start) >> 1
            var cmp = compareFn(el, arr[middle])
            if (cmp > 0) {
                start = middle + 1
            }
            else if (cmp < 0) {
                end = middle - 1
            }
            else {
                return middle
            }
        }
        return -start - 1
    })(this)

    if (index >= 0) {
        this.splice(index, 0, el)
    }
    else if (index < 0) {
        this.splice((index * -1) - 1, 0, el)
    }
    return this.length
}
