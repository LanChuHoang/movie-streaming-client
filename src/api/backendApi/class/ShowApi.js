import MediaApi from "./MediaApi";

const endpoint = {
  base: "/shows",
  search: "/shows/search",
};

class ShowApi extends MediaApi {
  static adminBaseFields = [
    "_id",
    "posterUrl",
    "title",
    "firstAirDate",
    "lastAirDate",
    "createdAt",
  ];

  constructor() {
    super(endpoint);
  }

  getPopularItems = (params = {}) => {
    return this.getLastestItems(params);
  };

  getLastestItems = (params = {}) => {
    return this.getBriefInfoItems(params);
  };

  getUpcomingItems = () => {
    throw new Error("Show API does not have upcoming route");
  };

  getDetailWithSeasons = async (id) => {
    const [{ data: detail }, { data: seasons }] = await Promise.all([
      this.getItem(id),
      this.getSeasons(id),
    ]);
    return { ...detail, seasons };
  };

  getSeasons = async (id) => {
    const res = await this.client.get(`${this.endpoint.base}/${id}/seasons`);
    console.log("get seasons api", res);
    return res;
  };

  getVideoUrl = async (showId, seasonNumber, episodeNumber) => {
    try {
      const { data: seasons } = await this.getSeasons(showId);
      const season = seasons?.find((s) => s.seasonNumber === seasonNumber);
      const episode = season?.episodes?.find(
        (e) => e.episodeNumber === episodeNumber
      );
      return episode?.videoUrl;
    } catch (error) {
      throw error;
    }
  };
}

export default ShowApi;
