module.exports = async d => {
    let [text] = d.function.parameters;

    let index = d.data.embeds.length

    if (isNaN(index) || Number(index) < 1 || !d.data.embeds[Number(index) - 1]) return d.throwError.func(d, '#(newEmbed) must be used before embed functions');

    d.data.embeds[Number(index) - 1] = d.data.embeds[Number(index) - 1]
    .setDescription(text);
};