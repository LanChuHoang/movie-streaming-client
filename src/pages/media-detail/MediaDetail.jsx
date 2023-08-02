import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import MediaApi from "../../api/backendApi/class/MediaApi";
import { toYoutubeVideoUrl } from "../../api/backendApi/helper";
import youtubeApi from "../../api/youtube/youtubeApi";
import Button, { OutlineButton } from "../../components/button/Button";
import HoverPopover from "../../components/hover-popover/hover-popover";
import MovieList from "../../components/movie-list/MovieList";
import SeasonList from "../../components/season-list/SeasonList";
import useBackendApi from "../../hooks/useBackendApi";
import CastList from "./cast-list/CastList";
import GenreList from "./genre-list/GenreList";
import "./mediaDetail.scss";
import VideoList from "./video-list/VideoList";

const MediaDetail = ({ itemType }) => {
  const { id } = useParams();
  const [item, setItem] = useState();
  const [sentimentOverview, setSentimentOverview] = useState();
  const [credits, setCredits] = useState();
  const [seasons, setSeasons] = useState();
  const [trailers, setTrailers] = useState();
  const trailersRef = useRef();
  const seasonsRef = useRef();
  const navigate = useNavigate();
  const backendApi = useBackendApi();
  const mediaApi = backendApi[itemType];
  const reviewApi = backendApi.review;

  useEffect(() => {
    const getDetail = async () => {
      try {
        const { data } = await mediaApi.getItem(id);
        setItem(data);
        window.scrollTo(0, 0);
      } catch (error) {
        console.log(error);
      }
    };
    getDetail();
  }, [itemType, id, mediaApi]);

  useEffect(() => {
    const getSentimentOverview = async () => {
      try {
        const { data } = await reviewApi.getSentimentOverview(id);
        console.log(data);
        setSentimentOverview(data);
      } catch (error) {
        if (error.response.status) setSentimentOverview(undefined);
        console.log(error);
      }
    };
    getSentimentOverview();
  }, [itemType, id, reviewApi]);

  useEffect(() => {
    const getCredits = async () => {
      try {
        const { data } = await mediaApi.getCredits(id);
        setCredits(data);
      } catch (error) {
        console.log(error);
      }
    };
    getCredits();
  }, [itemType, id, mediaApi]);

  useEffect(() => {
    const getSeasons = async () => {
      try {
        const { data } = await mediaApi.getSeasons(id);
        setSeasons(data.filter((s) => s.episodes.length > 0));
      } catch (error) {
        console.log(error);
      }
    };
    if (itemType === MediaApi.itemType.show) getSeasons();
  }, [itemType, id, mediaApi]);

  const handlePlay = () => {
    itemType === MediaApi.itemType.movie
      ? navigate(`/watch/movie/${id}`)
      : scrollToRef(seasonsRef);
  };

  useEffect(() => {
    const getTrailers = async (ids) => {
      try {
        const videoData = (
          await Promise.allSettled(
            ids.map((id) => youtubeApi.getVideoDetail(id))
          )
        )
          .filter((r) => r.status === "fulfilled")
          .map((r, i) => toVideoModel({ ...r.value, id: ids[i] }));
        setTrailers(videoData);
      } catch (error) {
        console.log(error);
      }
    };
    item?.trailers?.length > 0 ? getTrailers(item.trailers) : setTrailers([]);
  }, [item, id]);

  return (
    <>
      <div
        className="banner"
        style={{
          backgroundImage: `url(${item?.backdropUrl})`,
        }}
      />
      <div className="mb-3 movie-content container">
        <div className="movie-content__poster">
          <div
            className="movie-content__poster__img"
            style={{
              backgroundImage: `url(${item?.posterUrl?.replace(
                "w500",
                "original"
              )})`,
            }}
          />
        </div>
        <div className="movie-content__info">
          <h1 className="title">{item?.title}</h1>
          <GenreList itemType={itemType} genres={item?.genres} />

          <div>
            <div className="rating-overview">
              <div>
                {itemType == "movie"
                  ? toYear(item?.releaseDate)
                  : toYear(item?.firstAirDate) +
                    " - " +
                    toYear(item?.lastAirDate)}{" "}
                {formatTime(item?.runtime)}
              </div>
              <div className="rating-item">
                <svg
                  width="35"
                  height="14"
                  viewBox="0 0 35 14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <image
                    href="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                    width="100%"
                    height="100%"
                  />
                </svg>
                <span>8.5</span>
              </div>
              <div className="rating-item">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <image
                    href="https://upload.wikimedia.org/wikipedia/commons/5/52/Rotten_Tomatoes_rotten.svg"
                    width="100%"
                    height="100%"
                  />
                </svg>
                <span>44%</span>
              </div>
              {sentimentOverview && (
                <div className="rating-item youtube-review-overall">
                  <svg
                    width="20"
                    height="13"
                    viewBox="0 0 20 13"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <image
                      href="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                      width="100%"
                      height="100%"
                    />
                  </svg>
                  <div className="positve-percentage">
                    {Math.round(sentimentOverview.positivePercentage)}%{" "}
                    <HoverPopover
                      className="test"
                      hoverContent={`${sentimentOverview.positivePercentage}% of the ${sentimentOverview.totalReviews} comments on Youtube are positive.`}
                    >
                      <InfoOutlinedIcon
                        sx={{ fontSize: 15, color: "#ffffff", marginLeft: 0.5 }}
                      />
                    </HoverPopover>
                  </div>
                </div>
              )}
            </div>
            <p className="overview">{item?.overview}</p>
          </div>

          <div className="cast">
            <div className="section__header">
              <h2>Casts</h2>
            </div>
            <CastList cast={credits?.cast} />
          </div>
          <div className="buttons">
            <Button className="play-button" onClick={handlePlay}>
              <FontAwesomeIcon icon={faPlay} />
              Play
            </Button>
            <OutlineButton
              className="trailer-button"
              onClick={() => scrollToRef(trailersRef)}
            >
              Trailers
            </OutlineButton>
          </div>
        </div>
      </div>
      <div className="container" ref={seasonsRef}>
        {itemType === "show" && <SeasonList seasons={seasons} showId={id} />}
        <div className="section mb-3" ref={trailersRef}>
          <div className="section__header mb-1">
            <h2>Trailers</h2>
          </div>
          <VideoList videos={trailers} />
        </div>
        <div className="section mb-3">
          <div className="section__header mb-1">
            <h2>Similar</h2>
          </div>
          <MovieList
            id={item?._id || id}
            itemType={itemType}
            listType={MediaApi.listType.similar}
          />
        </div>
      </div>
    </>
  );
};

const scrollToRef = (ref) => {
  ref.current.scrollIntoView({ behavior: "smooth" });
};

const toVideoModel = (v) => ({
  title: v.title,
  thumbnailUrl: v.thumbnails.standard.url,
  srcUrl: toYoutubeVideoUrl(v.id),
});

function formatTime(durationInMinutes) {
  if (!durationInMinutes) return "";
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  let formattedTime = "";
  if (hours > 0) {
    formattedTime += hours + " hr ";
  }
  if (minutes > 0) {
    formattedTime += minutes + " min";
  }

  return formattedTime.trim();
}

function toYear(datetimeStr) {
  const date = new Date(datetimeStr);
  return date ? date.getFullYear() : "";
}

export default MediaDetail;
