function parseResultsToSrc({ publicUrl, fid }) {
  return `${publicUrl}/${fid}`;
}

module.exports = { parseResultsToSrc };
