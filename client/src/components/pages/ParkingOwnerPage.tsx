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
  Chip,
  CardContent,
  Rating,
  Card,
} from "@mui/material";
import { Add as AddIcon, Description } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import ParkingConstructor from '../constructor/ParkingConstructor';
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
import ReviewsModal from '../modals/ReviewsModal';
import { Review } from "../../types/review";
import axiosInstance from "../../services/axiosInstance";
import Constructor from '../Constructor/Constructor';

interface IParkingOption {
  parking(parking: any): unknown;
  label: string;
  value: number | string;
}

export default function ParkingOwnerPage() {
  const user = useAppSelector((state) => state.auth.user);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [addressMethod, setAddressMethod] = useState<"input" | "map">("input");
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [isConstructorModalOpen, setIsConstructorModalOpen] = useState(false);
  const [parkingSpaces, setParkingSpaces] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [constructorData, setConstructorData] = useState<any>(null);
  const [constructorLoading, setConstructorLoading] = useState(false);
  const [constructorError, setConstructorError] = useState<string | null>(null);

  const fetchParkings = async () => {
    try {
      const response = await axiosInstance.get("/parking-lots/all");
      setParkings(response.data);
    } catch (error) {
      console.error("Ошибка при получении парковок:", error);
    }
  };

  // const fetchReviews = async () => {
  //   try {
  //     const response = await axiosInstance.get("/reviews/all");
  //     setReviews(response.data);
  //   } catch (error) {
  //     console.error("Ошибка при получении отзывов:", error);
  //   }
  // };

  useEffect(() => {
    fetchParkings();
    // fetchReviews();
  }, []);

  const filteredReviews = selectedParking
    ? reviews.filter((review) => review.parking_id === selectedParking.id)
    : reviews;

  const { parkingLots } = useAppSelector((state) => state.parking);

  const [parkingData, setParkingData] = useState({
    status:"",
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
  }, [dispatch]);

  useEffect(() => {
    if (parkingLots && parkingLots.length > 0) {
      setParkingData(parkingLots[0]); // Устанавливаем данные первой парковки
    }
  }, [parkingLots]); // Обновляем данные когда parkingLots изменяется

  // Загрузка данных при открытии модального окна
  useEffect(() => {
    const fetchParkingSpaces = async () => {
      if (!isConstructorModalOpen || !selectedParking?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:3000/api/parking-lots/${selectedParking.id}/spaces`);
        if (!response.ok) throw new Error('Failed to fetch parking spaces');
        
        const data = await response.json();
        setParkingSpaces(data);
      } catch (err) {
        console.error('Error fetching spaces:', err);
        setError('Ошибка при загрузке данных парковки');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParkingSpaces();
  }, [isConstructorModalOpen, selectedParking?.id]);

  const handleDeleteClick = async () => {
    if (!selectedParking) return;

    if (window.confirm("Вы уверены, что хотите удалить эту парковку?")) {
      try {
        await dispatch(deleteMyParkings({ id: selectedParking.id })).unwrap();

        // Очищаем все состояния
        setSelectedParking(null);
        setParkingData({
          status: "",
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

  // Обработчик выбора парковки в Autocomplete
  const handleParkingChange = (
    _: React.SyntheticEvent,
    option: IParkingOption | null
  ) => {
    if (option) {
      // Проверяем права доступа
      if (user?.role === 'admin' || option.parking.owner_id === user?.id) {
        setSelectedParking(option.parking);
        // Устанавливаем данные выбранной парковки
        setParkingData({
          status: option.parking.status,
          name: option.parking.name,
          description: option.parking.description || "",
          location: {
            address: option.parking.location?.address || "",
            coordinates: {
              lat: option.parking.location?.coordinates?.lat || null,
              lon: option.parking.location?.coordinates?.lon || null,
            },
          },
          price_per_hour: option.parking.price_per_hour?.toString() || ""
        });
      } else {
        alert('У вас нет доступа к этой парковке');
        setSelectedParking(null);
      }
    } else {
      setSelectedParking(null);
      setParkingData({
        status: "",
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

  // Обработчик клика по кнопке просмотра отзывов
  const handleReviewsClick = () => {
    if (!selectedParking) return;
    
    // Проверяем права доступа перед открытием модального окна
    if (user?.role === 'admin' || selectedParking.owner_id === user?.id) {
      setIsReviewsModalOpen(true);
    } else {
      alert('У вас нет доступа к отзывам этой парковки');
    }
  };

  const handleConstructorClick = async () => {
    if (!selectedParking?.id) return;
    
    setConstructorLoading(true);
    setConstructorError(null);
    setIsConstructorModalOpen(true);

    try {
      const response = await fetch(`http://localhost:3000/api/parking-lots/${selectedParking.id}/spaces`);
      if (!response.ok) throw new Error('Failed to fetch parking spaces');
      
      const data = await response.json();
      setConstructorData(data);
    } catch (error) {
      console.error('Error loading constructor:', error);
      setConstructorError('Ошибка при загрузке конструктора');
    } finally {
      setConstructorLoading(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  // Обработчик сохранения изменений
  const handleSaveChanges = async () => {
    if (!selectedParking) return;

    try {
      setIsSaving(true);

      await dispatch(
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
          status: selectedParking.status // Сохраняем текущий статус
        })
      ).unwrap();

      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Обновляем список парковок
      const parkings = await dispatch(getMyParkings()).unwrap();
      
      // Находим обновленную парковку
      const updatedParking = parkings.find(p => p.id === selectedParking.id);
      if (updatedParking) {
        setSelectedParking(updatedParking);
        // Обновляем данные текущей парковки
        setParkingData({
          status: updatedParking.status,
          name: updatedParking.name,
          description: updatedParking.description || "",
          location: {
            address: updatedParking.location?.address || "",
            coordinates: {
              lat: updatedParking.location?.coordinates?.lat || null,
              lon: updatedParking.location?.coordinates?.lon || null,
            },
          },
          price_per_hour: updatedParking.price_per_hour?.toString() || ""
        });
      }
    } catch (error) {
      console.error("Ошибка при сохранении изменений:", error);
      setError("Ошибка при сохранении изменений");
    } finally {
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

      // Загружаем сущесвующие парковки
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'На рассмотрении',
          color: 'warning' as const,
        };
      case 'active':
        return {
          label: 'Активна',
          color: 'success' as const,
        };
      case 'inactive':
        return {
          label: 'Неактивна',
          color: 'error' as const,
        };
      default:
        return {
          label: 'Статус неизвестен',
          color: 'default' as const,
        };
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
        options={(Array.isArray(parkingLots) ? parkingLots : []).map((parking) => ({
          label: parking.name,
          value: parking.id,
          parking: parking
        }))}
        value={selectedParking ? {
          label: selectedParking.name,
          value: selectedParking.id,
          parking: selectedParking
        } : null}
        onChange={handleParkingChange}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label="Выберите парковку"
            sx={{ width: '', minWidth: 300 }}
          />
        )}
        sx={{ width: '', minWidth: 300 }}
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
            gap: 2,
            justifyContent: "space-between",
            margin: { xs: 1, sm: 2, md: 4, lg: 6 },
            height: 'calc(100vh - 100px)',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              width: "65%",
              height: "100%",
              overflow: 'hidden'
            }}
          >
            {selectedParking && (
              <>
                {constructorLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : constructorError ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="error">{constructorError}</Typography>
                  </Box>
                ) : constructorData ? (
                  <ParkingConstructor 
                    parkingId={selectedParking.id}
                    isEditable={user?.role === 'admin' || selectedParking.owner_id === user?.id}
                    initialSpaces={constructorData.ParkingSpaces || []}
                  />
                ) : null}
              </>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              width: "33%",
              height: "100%",
              overflow: 'auto',
              gap: 1,
              padding: 2,
              bgcolor: 'background.paper',
              boxShadow: 1
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">Статус:</Typography>
              <Chip
                label={getStatusInfo(parkingData.status).label}
                color={getStatusInfo(parkingData.status).color}
                size="small"
              />
            </Stack>

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
              onClick={handleConstructorClick}
              disabled={!selectedParking}
              sx={{ mt: 2 }}
            >
              Конструктор мест
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleReviewsClick}
              disabled={!selectedParking}
            >
              Посмотреть отзывы
            </Button>

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

      <Modal
        open={isConstructorModalOpen}
        onClose={() => {
          setIsConstructorModalOpen(false);
          setConstructorData(null);
        }}
        aria-labelledby="constructor-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          height: '90%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          overflow: 'auto'
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Конструктор парковки: {selectedParking?.name}
          </Typography>
          
          {constructorLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : constructorError ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="error">{constructorError}</Typography>
            </Box>
          ) : constructorData ? (
            <Box sx={{ width: '100%', height: 'calc(100% - 60px)' }}>
              <ParkingConstructor 
                parkingId={selectedParking?.id}
                isEditable={user?.role === 'admin' || selectedParking?.owner_id === user?.id}
                initialSpaces={constructorData.ParkingSpaces || []}
              />
            </Box>
          ) : null}
        </Box>
      </Modal>

      <ReviewsModal
        open={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        selectedParkingId={selectedParking?.id}
        parkingName={selectedParking?.name}
      />
    </Box>
  );
}
