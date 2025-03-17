import { useEffect, useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import SingleMovieScreen from "./singleMovieScreen";

interface Movie {
  title: string;
  poster_path: string | null;
  overview: string;
  isLiked: boolean;
  id: number;
}

interface ApiResponse {
  results: Movie[];
  total_pages: number;
}

const apiKey = "ceba03f56c18f997a242eb118d552605";
const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16`;

export default function MainScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMovies = async (pageNumber: number) => {
    if (pageNumber > totalPages) return;

    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`${apiUrl}&page=${pageNumber}`);
      const data = (await response.json()) as ApiResponse;

      const moviesWithNumberId = data.results
        .map((movie) => ({
          ...movie,
          id: Number(movie.id),
        }))
        .filter((movie) => movie.title !== "Le Clitoris");

      setMovies((prevMovies) =>
        pageNumber === 1
          ? moviesWithNumberId
          : [...prevMovies, ...moviesWithNumberId]
      );

      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMovies(1);
  }, []);

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        {loading ? (
          <ActivityIndicator size="large" color="#C8A2C8" />
        ) : (
          <FlatList
            data={movies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <SingleMovieScreen movie={item} />}
            numColumns={2}
            contentContainerStyle={tw`pb-20 items-center`}
            columnWrapperStyle={tw`justify-between`}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color="#C8A2C8" />
              ) : page < totalPages ? (
                <TouchableOpacity
                  onPress={loadMore}
                  style={tw`bg-[#373b69] py-3 px-6 rounded-lg mt-4`}
                >
                  <Text style={tw`text-white font-bold text-center`}>
                    See More
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
