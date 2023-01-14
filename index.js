const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios");
const dotenv = require("dotenv");
const nation = require("./nation");
dotenv.config();
app.use(cors());
app.get("/home", async (req, res, next) => {
  try {
    const popularMovies = await axios
      .get(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.API_KEY}&language=ko-KR&page=1&region=KR`
      )
      .then((res) => {
        return res.data.results.map((posterInfo, index) => {
          return {
            id: posterInfo["id"],
            order: index + 1,
            title: posterInfo["title"],
            overview: `${posterInfo["overview"].substring(0, 140)}...`,
            voteAverage: posterInfo["vote_average"],
            posterPath: posterInfo["poster_path"],
          };
        });
      });
    return res.send(JSON.stringify(popularMovies));
  } catch (error) {
    console.error(error);
    return res.send(error);
  }
});

app.get("/search", async (req, res, next) => {
  let { keyword, page } = req.query;
  keyword = encodeURI(keyword);
  try {
    const searchResult = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&language=ko-KR&query=${keyword}&page=${page}&include_adult=true&region=KR`
    );
    return res.send({
      page: searchResult.data.page,
      totalPage: searchResult.data.total_pages,
      results: searchResult.data.results.map((movieInfo) => {
        return {
          title: movieInfo.title,
          id: movieInfo.id,
          posterPath: movieInfo.poster_path,
          rate: movieInfo.vote_average,
          release:
            movieInfo.release_date === "" ? "정보없음" : movieInfo.release_date,
        };
      }),
    });
  } catch (error) {
    console.error(error);
    return res.send(error.message);
  }
});

app.get("/detail", async (req, res, next) => {
  const { id } = req.query;
  try {
    const movieDetailData = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.API_KEY}&language=ko-KR`
    );
    const processData = {};
    processData.genres = movieDetailData.data.genres.map((genresObj) => {
      return genresObj.name;
    });
    processData.title = movieDetailData.data["title"];
    processData.release = movieDetailData.data["release_date"];
    processData.nation =
      movieDetailData.data["production_countries"][0] === undefined
        ? "정보없음"
        : nation[movieDetailData.data["production_countries"][0]["name"]];
    processData.runtime = movieDetailData.data["runtime"] + "분";
    processData.rate = movieDetailData.data["vote_average"].toFixed(2);
    processData.posterPath = movieDetailData.data["poster_path"];
    processData.overview = movieDetailData.data["overview"];
    processData.tagline = movieDetailData.data["tagline"];
    return res.send(JSON.stringify(processData));
  } catch (error) {
    console.error(error);
    return res.send("error");
  }
});

app.listen(process.env.PORT || 8000, function () {
  console.log("CORS-enabled web server listening on port 8000");
});
