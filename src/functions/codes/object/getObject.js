module.exports = async d => {
    let [format = "false", name = 'default'] = d.function.parameters;

    if (!d.data.objects[name]) return d.throwError.invalid(d, 'object name', name);

    return JSON.stringify(d.data.objects[name], null, format === "true"? 2 : 0);
};