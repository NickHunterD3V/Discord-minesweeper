module.exports = async d => {
    let [property = "message"] = d.function.parameters;
    
    return d.data.error[property.toLowerCase()];
}