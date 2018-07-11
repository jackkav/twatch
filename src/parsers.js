export const sanitiseMusic = input =>
  input
    .replace(/\(\d{4}\)/g, '')
    .replace(/mp3/gi, '')
    .replace(/\(320kbps\)/g, '')
    .replace(/320kbps/g, '')
    .replace(/\[.*\]/g, '')
    .trim()
const getUploadMetadata = input => {
  const size =
    input.match(/Size (.*?), ULed/) &&
    input.match(/Size (.*?), ULed/).length > 1 &&
    input
      .match(/Size (.*?), ULed/)[1]
      .replace('MiB', 'MB')
      .replace('GiB', 'GB')

  const uploadedIndex = input.indexOf('Uploaded')
  const sizeIndex = input.indexOf(' Size')
  const endOfTitleIndex = uploadedIndex
  const y =
    input.match(/2015/) || input.match(/2016/) || input.match(/2017/) || input.match(/2018/) || input.match(/2019/)
  const year = y ? y.toString() : new Date().getFullYear().toString()
  const yearIndex = input.slice(0, endOfTitleIndex - 1).indexOf(year)
  const title = input
    .slice(0, endOfTitleIndex - 1)
    .replace(/\./g, ' ')
    .replace(/\n/g, '')
    .replace(/\t/g, '')
    .trim()
  const uploadedAtTime = input
    .slice(uploadedIndex + 9, sizeIndex - 1)
    .replace(/\./g, ' ')
    .replace(/\n/g, '')
    .replace(/\t/g, '')
  const uploadedAt = parseLooseDate(uploadedAtTime)
  const full = input
    .replace(/\./g, ' ')
    .replace(/\n/g, '')
    .replace(/\t/g, '')
    .trim()
  return { title, yearIndex, size, year, uploadedAt, full }
}
const getMovieMetadata = (input, yearIndex) => {
  const r =
    input.match(/HDRip/i) ||
    input.match(/BRRip/i) ||
    input.match(/DVDRip/i) ||
    input.match(/DVDScr/i) ||
    input.match(/WED-DL/i) ||
    input.match(/CAM/i) ||
    input.match(/HDCAM/i) ||
    input.match(/HD CAM/i) ||
    input.match(/HD-TS/i) ||
    input.match(/HD-TC/i) ||
    input.match(/TSRip/i) ||
    input.match(/HDTS/i) ||
    input.match(/HD TS/i) ||
    input.match(/TS/i) ||
    input.match(/HD TC/i)
  const lowQuality =
    input.match(/CAM/i) ||
    input.match(/HDCAM/i) ||
    input.match(/HD CAM/i) ||
    input.match(/HD-TS/i) ||
    input.match(/HD-TC/i) ||
    input.match(/TSRip/i) ||
    input.match(/HDTS/i) ||
    input.match(/HD TS/i) ||
    input.match(/TS/i) ||
    input.match(/HD TC/i)

  const quality = r ? r.toString() : 'N/A'
  const hd = !lowQuality
  const qualityIndex = input.indexOf(quality)

  const endOfMovieTitle = yearIndex > 0 ? yearIndex : qualityIndex
  const movieTitle = input
    .slice(0, endOfMovieTitle - 1)
    .replace(/\./g, ' ')
    .replace(/\n/g, '')
    .replace(/\t/g, '')
    .trim()
  return { hd, movieTitle, quality }
}

const topics = {
  movies: 'aggro.pb.201',
  music: 'aggro.pb.101',
}
export const pbParse = (input, type = topics.movies) => {
  if (!input) return false
  const meta = getUploadMetadata(input)
  if (type === topics.music) {
    return meta
  }
  if (type === topics.movies) {
    return {
      ...meta,
      ...getMovieMetadata(input, meta.yearIndex),
    }
  }
}

const parseLooseDate = uploadedAt => {
  // console.log(uploadedAt)
  const today = new Date()
  if (uploadedAt.includes('Today')) return new Date().toISOString()
  else if (uploadedAt.includes('Y-day')) return new Date(today.setDate(today.getDate() - 1)).toISOString()
  else if (uploadedAt.includes(':'))
    return new Date(today.getUTCFullYear() + '-' + uploadedAt.replace(' ', 'T')).toISOString()
  else return new Date(uploadedAt.split(' ')[1] + '-' + uploadedAt.split(' ')[0]).toISOString()
}
