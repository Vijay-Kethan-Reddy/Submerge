export const getMockTopTracks = () => {
  const generateTracks = (count, label) =>
    Array.from({ length: count }).map((_, i) => ({
      id: `${label}-${i}`,
      title: `${label} Track ${i + 1}`,
      artist: `Artist ${i + 1}`,
      cover: `https://via.placeholder.com/100x100.png?text=${label}${i + 1}`,
    }));

  return {
    top10: generateTracks(10, 'Top10'),
    top100: generateTracks(100, 'Top100'),
    globalHits: generateTracks(10, 'Hit'),
    latestHits: generateTracks(10, 'Latest'),
    top50: generateTracks(50, 'Top50'),
    newReleases: generateTracks(10, 'New Releases'),
    topTrending: generateTracks(10, 'Top Trending'),

  };
};
