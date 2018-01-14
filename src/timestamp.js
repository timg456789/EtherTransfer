function Timestamp() {
    function pad(num) {
        return num < 10 ? '0' + num : num;
    }

    this.getTimestamp = function() {
        let dt = new Date();
        return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}` +
            `-T-${pad(dt.getUTCHours())}-${pad(dt.getUTCMinutes())}-${pad(dt.getUTCSeconds())}-${pad(dt.getUTCMilliseconds())}` +
            'Z';
    }
}
module.exports = Timestamp;