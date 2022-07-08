module.exports = async d => {
    let [property] = d.function.parameters;

    if (!['rateLimit'].includes(d.eventType)) return d.throwError.allow(d)

    let properties = {
        mstimeout: d.rateLimit.timeout,
        limit: d.rateLimit.limit,
        method: d.rateLimit.method,
        path: d.rateLimit.path,
        route: d.rateLimit.route,
        isglobal: d.rateLimit.global ? 'true' : 'false'
    }

    if (!properties[property.toLowerCase()]) return d.throwError.invalid(d, 'property', property)

    return properties[property.toLowerCase()]
};