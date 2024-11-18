import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Container,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Modal,
  Paper,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import { Add as AddIcon, Description } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import ParkingConstructor from "../constructor/ParkingConstructor";
import { Link, useNavigate } from "react-router-dom";
import { load } from "@2gis/mapgl";
import {
  createParking,
  getMyParkings,
  updateMyParkings,
  deleteMyParkings,
} from "../../redux/parkingThunks";
import { Parking } from "../../types/parking";
import { LocationButton } from "../map/LocationButton";

interface IParkingOption {
  parking(parking: any): unknown;
  label: string;
  value: number | string;
}

export default function ParkingOwnerPage() {
  const { user } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [addressMethod, setAddressMethod] = useState<"input" | "map">("input");
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  const { parkingLots } = useAppSelector((state) => state.parking);

  const [parkingData, setParkingData] = useState({
    name: "",
    description: "",
    location: {
      address: "",
      coordinates: {
        lat: null,
        lon: null,
      },
    },
    price_per_hour: ""   
  });

  useEffect(() => {
    dispatch(getMyParkings());
  }, []); // Загружаем парковки только при монтировании

  useEffect(() => {
    if (parkingLots && parkingLots.length > 0) {
      setParkingData(parkingLots[0]); // Устанавливаем данные первой парковки
    }
  }, [parkingLots]); // Обновляем данные когда parkingLots изменяется

const handleDeleteClick = async () => {
  if (!selectedParking) return;

  if (window.confirm("Вы уверены, что хотите удалить эту парковку?")) {
    try {
      await dispatch(deleteMyParkings({ id: selectedParking.id })).unwrap();

      // Очищаем все состояния
      setSelectedParking(null);
      setParkingData({
        name: "",
        description: "",
        location: {
          address: "",
          coordinates: {
            lat: null,
            lon: null,
          },
        },
        price_per_hour: "",
      });

      // Обновляем список парковок и очищаем Autocomplete
      await dispatch(getMyParkings());
    } catch (error) {
      console.error("Ошибка при удалении парковки:", error);
      setError("Ошибка при удалении парковки");
    }
  }
};

  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);

  const handleParkingChange = (
    _: React.SyntheticEvent,
    option: IParkingOption | null
  ) => {
    if (option) {
      setSelectedParking(option.parking);
      setParkingData({
        name: option.parking.name,
        description: option.parking.description || "",
        location: {
          address: option.parking.location.address,
          coordinates: {
            lat: option.parking.location.coordinates.lat,
            lon: option.parking.location.coordinates.lon,
          },
        },
        price_per_hour: option.parking.price_per_hour.toString()       
      });
    } else {
      setSelectedParking(null);
      setParkingData({
        name: "",
        description: "",
        location: {
          address: "",
          coordinates: {
            lat: null,
            lon: null,
          },
        },
        price_per_hour: ""
      });
    }
  };

const [isSaving, setIsSaving] = useState(false);

const handleSaveChanges = async () => {
  if (!selectedParking) return;

  try {
    // Включаем индикатор загрузки
    setIsSaving(true);

    // Отправляем запрос на обновление
    const updatedData = await dispatch(
      updateMyParkings({
        id: selectedParking.id,
        name: parkingData.name,
        description: parkingData.description,
        location: {
          address: parkingData.location?.address || "",
          coordinates: {
            lat: parkingData.location?.coordinates?.lat || null,
            lon: parkingData.location?.coordinates?.lon || null,
          },
        },
        price_per_hour: Number(parkingData.price_per_hour),
      })
    ).unwrap();

    // Имитируем задержку
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Получаем обновленный список парковок
    const parkings = await dispatch(getMyParkings()).unwrap();

    const updatedParking = parkings.find((p) => p.id === selectedParking.id);

    if (updatedParking) {
      setSelectedParking(updatedParking);
      setParkingData({
        name: updatedParking.name,
        description: updatedParking.description || "",
        location: {
          address: updatedParking.location?.address || "",
          coordinates: {
            lat: updatedParking.location?.coordinates?.lat || null,
            lon: updatedParking.location?.coordinates?.lon || null,
          },
        },
        price_per_hour: updatedParking.price_per_hour.toString(),
      });
    }
  } catch (error) {
    console.error("Ошибка при сохранении изменений:", error);
    setError("Ошибка при сохранении изменений");
  } finally {
    // Выключаем индикатор загрузки
    setIsSaving(false);
  }
};

  const [addressSuggestions, setAddressSuggestions] = useState<
    Array<{
      name: string;
      full_name: string;
      coordinates: [number, number];
    }>
  >([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<any>(null);
  const [mapglAPI, setMapglAPI] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (addressMethod === "map" && !map) {
      initMap();
    }
    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [addressMethod]);

  const getCurrentPosition = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];
            resolve(coords);
          },
          (error) => {
            console.error("Ошибка получения геолокации:", error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        reject(new Error("Геолокация недоступна"));
      }
    });
  };

  const createUserMarker = (
    mapglAPI: any,
    map: any,
    coords: [number, number]
  ) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.destroy();
      userMarkerRef.current = null;
    }

    try {
      const marker = new mapglAPI.Marker(map, {
        coordinates: coords,
        label: {
          text: "Вы здесь",
          offset: [0, -60],
          relativeAnchor: [0.5, 0],
        },
      });

      userMarkerRef.current = marker;
      map.setCenter(coords);
      map.setZoom(15);

      return marker;
    } catch (error) {
      console.error("Ошибка при создании маркера:", error);
      return null;
    }
  };

  const initMap = async () => {
    try {
      setIsLoading(true);
      const mapglAPI = await load();
      setMapglAPI(mapglAPI);

      if (!mapContainerRef.current) return;

      const userCoords = await getCurrentPosition();

      const mapInstance = new mapglAPI.Map(mapContainerRef.current, {
        center: userCoords,
        zoom: 15,
        key: import.meta.env.VITE_2GIS_API_KEY,
      });

      // Создаем маркер пользователя
      createUserMarker(mapglAPI, mapInstance, userCoords);

      // Загружаем существующие парковки
      try {
        const response = await fetch(
          "http://localhost:3000/api/parking-lots/all"
        );
        if (!response.ok) {
          throw new Error("Ошибка при загрузке парковок");
        }
        const existingParkings = await response.json();

        // Добавляем маркеры существующих парковок
        existingParkings.forEach((parking: Parking) => {
          new mapglAPI.Marker(mapInstance, {
            coordinates: [
              parking.location.coordinates.lon,
              parking.location.coordinates.lat,
            ],
            label: {
              text: `${parking.price_per_hour}₽/час`,
              offset: [0, -60],
              relativeAnchor: [0.5, 0],
            },
          });
        });
      } catch (error) {
        console.error("Ошибка при загрузке существующих парковок:", error);
      }

      // Создаем маркер для новой парковки
      const parkingMarker = new mapglAPI.Marker(mapInstance, {
        coordinates: userCoords,
        draggable: true,
        label: {
          text: "Новая парковка",
          offset: [0, -60],
          relativeAnchor: [0.5, 0],
        },
      });

      // Обработчик клика по карте
      mapInstance.on("click", async (e: any) => {
        const coordinates = e.lngLat;
        parkingMarker.setCoordinates(coordinates);

        try {
          const response = await fetch(
            `https://catalog.api.2gis.com/3.0/items/geocode?lat=${
              coordinates[1]
            }&lon=${coordinates[0]}&key=${import.meta.env.VITE_2GIS_API_KEY}`
          );
          const data = await response.json();
          const address = data.result.items[0]?.full_name || "Адрес не найден";

          setParkingData((prev) => ({
            ...prev,
            location: {
              address,
              coordinates: {
                lat: coordinates[1],
                lon: coordinates[0],
              },
            },
          }));
        } catch (error) {
          console.error("Ошибка при получении адреса:", error);
        }
      });

      setMap(mapInstance);
      setMarker(parkingMarker);
      setIsLoading(false);
    } catch (error) {
      console.error("Ошибка при инициализации карты:", error);
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParkingData((prev) => ({
      ...prev,
      ...(name === "address"
        ? { location: { ...prev.location, address: value } }
        : { [name]: value }),
    }));
  };

  const handleAddressInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    console.log("Input value:", value);
    handleChange(e);

    if (value.length < 3) {
      console.log("Input too short, clearing suggestions");
      setAddressSuggestions([]);
      return;
    }

    try {
      // const url = `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(value)}&fields=items.point,items.full_name&key=${import.meta.env.VITE_2GIS_API_KEY}`;
      console.log("Fetching suggestions from:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("API Response:", data);

      if (!data.result || !data.result.items) {
        console.log("No items in response");
        return;
      }

      const suggestions = data.result.items
        .filter((item: any) => item.point && item.full_name)
        .map((item: any) => ({
          name: item.name || "",
          full_name: item.full_name,
          coordinates: [item.point.lon, item.point.lat],
        }));

      console.log("Processed suggestions:", suggestions);
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSuggestionSelect = (
    suggestion: (typeof addressSuggestions)[0]
  ) => {
    console.log("Selected suggestion:", suggestion);
    setParkingData((prev) => ({
      ...prev,
      location: {
        address: suggestion.full_name,
        coordinates: {
          lat: suggestion.coordinates[1],
          lon: suggestion.coordinates[0],
        },
      },
    }));
    setAddressSuggestions([]);

    if (map && marker) {
      console.log("Moving marker to:", suggestion.coordinates);
      marker.setCoordinates(suggestion.coordinates);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (
      !parkingData.name.trim() ||
      !parkingData.location.address.trim() ||
      !parkingData.price_per_hour
    ) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }

    try {
      const result = await dispatch(
        createParking({
          ...parkingData,
          price_per_hour: Number(parkingData.price_per_hour),
          status: 'pending'
        })
      ).unwrap();

      navigate(`/parking-constructor/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка при создании парковки");
      console.error("Error details:", err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
      }}
    >
      <Autocomplete
        disablePortal
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Парковка" />}
        options={
          Array.isArray(parkingLots)
            ? parkingLots.map((parking) => ({
                label: parking.name,
                value: parking.id,
                parking: parking,
              }))
            : []
        }
        onChange={handleParkingChange}
        value={
          selectedParking
            ? {
                label: selectedParking.name,
                value: selectedParking.id,
                parking: selectedParking,
              }
            : null
        }
      />
      {!selectedParking ? (
        <Typography sx={{ mt: 4, color: "text.secondary" }}>
          Выберите парковку для просмотра и редактирования
        </Typography>
      ) : (
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            gap: 4, // Добавляем отступ между элементами
            justifyContent: "space-around",
            margin: 10,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              m: 0, // Убираем margin у Box'ов, чтобы избежать наложения отступов
              borderRadius: 5,
              height: "100%",
              width: "60%",
            }}
          >
            Тут элемент с местами на парковке
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              m: 0, // Убираем margin у Box'ов, чтобы избежать наложения отступов
              borderRadius: 5,
              height: "100%",
              width: "40%",
              gap: 1,
            }}
          >
            <TextField
              size="small"
              required
              fullWidth
              name="name"
              label="Название парковки"
              value={parkingData.name}
              onChange={handleChange}
              autoFocus
            />

            <TextField
              size="small"
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Описание парковки"
              value={parkingData.description}
              onChange={handleChange}
              helperText="Укажите особенности парковки, режим работы и другую полезную информацию"
            />

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Tabs
                value={addressMethod}
                onChange={(_, value) => setAddressMethod(value)}
                sx={{
                  mb: 2,
                  "& .MuiTabs-flexContainer": {
                    justifyContent: "flex-start",
                  },
                }}
              >
                <Tab value="input" label="Ввести адрес" />
                <Tab value="map" label="Выбрать на карте" />
              </Tabs>
            </Box>

            {addressMethod === "map" ? (
              <Box sx={{ position: "relative", width: "100%" }}>
                {isLoading && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      zIndex: 2,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
                <Box
                  ref={mapContainerRef}
                  sx={{ height: 350, width: "100%", mb: 1 }}
                />
                <LocationButton
                  onLocationFound={(coords) => {
                    if (!map || !mapglAPI) return;
                    createUserMarker(mapglAPI, map, coords);
                  }}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Выбранный адрес"
                  value={parkingData.location.address}
                  disabled
                />
              </Box>
            ) : (
              <Box sx={{ position: "relative", width: "100%" }}>
                <TextField
                  size="small"
                  required
                  fullWidth
                  name="address"
                  label="Адрес парковки"
                  value={parkingData.location.address}
                  onChange={handleAddressInput}
                  autoComplete="off"
                />
                {addressSuggestions.length > 0 && (
                  <Paper
                    sx={{
                      position: "absolute",
                      width: "100%",
                      maxHeight: 200,
                      overflow: "auto",
                      zIndex: 1000,
                      mt: 1,
                    }}
                  >
                    {addressSuggestions.map((suggestion, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <Typography variant="body2">
                          {suggestion.full_name}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>
            )}

            <TextField
              size="small"
              required
              fullWidth
              name="price_per_hour"
              label="Цена за час (руб)"
              type="number"
              value={parkingData.price_per_hour}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />

            <Button
              fullWidth
              variant="outlined"
              size="small"
              component={Link}
              to="/errorpage"
            >
              Статистика
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              component={Link}
              to="/errorpage"
            >
              Посмотреть отзывы
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Сохранение...
                </>
              ) : (
                "Сохранить изменения"
              )}
            </Button>
            <Button
              fullWidth
              variant="contained"
              size="small"
              color="error"
              onClick={handleDeleteClick}
            >
              Удалить
            </Button>
          </Box>
        </Container>
      )}
    </Box>
  );
}
