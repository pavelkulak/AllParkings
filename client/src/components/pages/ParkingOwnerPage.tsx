import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  Stack,
  Paper,
  CircularProgress,
  Tab,
  Tabs,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { showNotification } from "../../redux/slices/uiSlice";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { load } from "@2gis/mapgl";
import {
  getMyParkings,
  updateMyParkings,
  deleteMyParkings,
} from "../../redux/parkingThunks";
import { LocationButton } from "../map/LocationButton";
import ReviewsModal from '../modals/ReviewsModal';

import ParkingEditor from '../parking/ParkingEditor';
import { FileUploader } from '../common/FileUploader';
export default function ParkingOwnerPage() {

  const { parkingLots } = useAppSelector((state) => state.parking);
  const dispatch = useAppDispatch();

  const [addressMethod, setAddressMethod] = useState<"input" | "map">("input");
  const [map, setMap] = useState<any>(null);
  const [_, setMarker] = useState<any>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [mapglAPI, setMapglAPI] = useState<any>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<any>(null);

  const [parkingData, setParkingData] = useState({
    status: "",
    name: "",
    description: "",
    location: {
      address: "",
      coordinates: {
        lat: null as number | null,
        lon: null as number | null,
      },
    },
    price_per_hour: ""
  });

  useEffect(() => {
    dispatch(getMyParkings());
  }, [dispatch]);

  const handleDeleteClick = async () => {
    if (!selectedParking) return;
    if (window.confirm("Вы уверены, что хотите удалить эту парковку?")) {
      try {
        await dispatch(deleteMyParkings({ id: selectedParking.id })).unwrap();
        setSelectedParking(null);
        dispatch(getMyParkings());
        dispatch(showNotification({ message: 'Парковка удалена', severity: 'success' }));
      } catch (error) {
        dispatch(showNotification({ message: 'Ошибка при удалении', severity: 'error' }));
      }
    }
  };

  const handleReviewsClick = () => {
    if (!selectedParking) return;
    setIsReviewsModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedParking) return;
    try {
      setIsSaving(true);
      const updateData: any = {
        id: selectedParking.id.toString(),
        name: parkingData.name,
        description: parkingData.description,
        location: parkingData.location,
        price_per_hour: Number(parkingData.price_per_hour),
      };

      if (files.length > 0) {
        updateData.image = files[0];
      }

      await dispatch(updateMyParkings(updateData)).unwrap();
      await dispatch(getMyParkings());
      dispatch(showNotification({ message: 'Изменения сохранены', severity: 'success' }));
    } catch (error) {
      dispatch(showNotification({ message: 'Ошибка сохранения', severity: 'error' }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParkingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setParkingData(prev => ({ ...prev, location: { ...prev.location, address: value } }));

    if (value.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(value)}&fields=items.point,items.full_name&key=${import.meta.env.VITE_2GIS_API_KEY}`);
      const data = await response.json();
      if (data.result?.items) {
        setAddressSuggestions(data.result.items.map((item: any) => ({
          full_name: item.full_name,
          coordinates: [item.point.lon, item.point.lat]
        })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    setParkingData(prev => ({
      ...prev,
      location: {
        address: suggestion.full_name,
        coordinates: { lat: suggestion.coordinates[1], lon: suggestion.coordinates[0] }
      }
    }));
    setAddressSuggestions([]);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Активна', color: 'success' as const };
      case 'pending': return { label: 'На проверке', color: 'warning' as const };
      case 'inactive': return { label: 'Неактивна', color: 'error' as const };
      default: return { label: 'Неизвестно', color: 'default' as const };
    }
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  // Map logic remains the same but initialized only when needed
  const initMap = async () => {
    if (!mapContainerRef.current) return;
    try {
      const api = await load();
      setMapglAPI(api);
      const center: [number, number] = parkingData.location.coordinates.lat
        ? [parkingData.location.coordinates.lon!, parkingData.location.coordinates.lat!]
        : [37.6176, 55.7558];

      const instance = new api.Map(mapContainerRef.current, {
        center,
        zoom: 15,
        key: import.meta.env.VITE_2GIS_API_KEY
      });

      const m = new api.Marker(instance, { coordinates: center });
      setMap(instance);
      setMarker(m);

      instance.on('click', async (e: any) => {
        const coords = e.lngLat;
        m.setCoordinates(coords);
        try {
          const res = await fetch(`https://catalog.api.2gis.com/3.0/items/geocode?lat=${coords[1]}&lon=${coords[0]}&key=${import.meta.env.VITE_2GIS_API_KEY}`);
          const d = await res.json();
          const addr = d.result?.items[0]?.full_name || "Неизвестный адрес";
          setParkingData(prev => ({
            ...prev,
            location: {
              address: addr,
              coordinates: { lat: coords[1], lon: coords[0] }
            }
          }));
        } catch (e) { console.error(e); }
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (addressMethod === 'map' && !map) {
      initMap();
    }
  }, [addressMethod]);

  const createUserMarker = (api: any, m: any, coords: [number, number]) => {
    if (userMarkerRef.current) userMarkerRef.current.destroy();
    userMarkerRef.current = new api.Marker(m, { coordinates: coords });
    m.setCenter(coords);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      {!selectedParking ? (
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={900} gutterBottom sx={{
              letterSpacing: '-1px',
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Мои парковки
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.8 }}>
              Управление вашими объектами и конфигурациями
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {parkingLots.map((parking) => (
              <Grid item xs={12} sm={6} md={4} key={parking.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 5,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      setSelectedParking(parking);
                      setParkingData({
                        status: parking.status,
                        name: parking.name,
                        description: parking.description || "",
                        location: {
                          address: parking.location?.address || "",
                          coordinates: {
                            lat: parking.location?.coordinates?.lat || null,
                            lon: parking.location?.coordinates?.lon || null,
                          },
                        },
                        price_per_hour: parking.price_per_hour?.toString() || ""
                      });
                    }}
                    sx={{ flexGrow: 1 }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={parking.img ? `${import.meta.env.VITE_API_URL}/img/parking/${parking.img}` : "/parking-placeholder.jpg"}
                        alt={parking.name}
                      />
                      <Chip
                        label={getStatusInfo(parking.status).label}
                        color={getStatusInfo(parking.status).color}
                        size="small"
                        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 800 }}
                      />
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={800} noWrap gutterBottom>
                        {parking.name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', mb: 2 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" noWrap>{parking.location?.address}</Typography>
                      </Stack>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary.main" fontWeight={900}>
                          {parking.price_per_hour} ₽/ч
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ fontWeight: 700, borderRadius: 2 }}>Изменить</Button>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
            {parkingLots.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '2px dashed', borderColor: 'divider' }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>Список парковок пуст</Typography>
                  <Button variant="contained" component={Link} to="/parkings/create" sx={{ mt: 2, borderRadius: 3, fontWeight: 800 }}>Добавить парковку</Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>
      ) : (
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedParking(null)} sx={{ fontWeight: 700 }}>
              Ко всем парковкам
            </Button>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<RateReviewIcon />} onClick={handleReviewsClick} sx={{ borderRadius: 2 }}>
                Отзывы
              </Button>
              <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={handleDeleteClick} sx={{ borderRadius: 2 }}>
                Удалить
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={4}>
            <Grid item xs={12} lg={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid', borderColor: 'divider', position: 'sticky', top: 20 }}>
                <Typography variant="h5" fontWeight={900} mb={3}>Информация</Typography>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">СТАТУС</Typography>
                    <Box mt={0.5}>
                      <Chip label={getStatusInfo(parkingData.status).label} color={getStatusInfo(parkingData.status).color} size="small" sx={{ fontWeight: 800 }} />
                    </Box>
                  </Box>

                  <TextField fullWidth name="name" label="Название" value={parkingData.name} onChange={handleChange} />
                  <TextField fullWidth name="price_per_hour" label="Цена (₽/час)" type="number" value={parkingData.price_per_hour} onChange={handleChange} />
                  <TextField fullWidth multiline rows={4} name="description" label="Описание" value={parkingData.description} onChange={handleChange} />

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} mb={2}>Расположение</Typography>
                    <Tabs value={addressMethod} onChange={(_, v) => setAddressMethod(v)} variant="fullWidth" sx={{ mb: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Tab value="input" label="Адрес" sx={{ fontWeight: 700 }} />
                      <Tab value="map" label="На карте" sx={{ fontWeight: 700 }} />
                    </Tabs>

                    {addressMethod === 'input' ? (
                      <Box sx={{ position: 'relative' }}>
                        <TextField fullWidth label="Поиск адреса" value={parkingData.location.address} onChange={handleAddressInput} />
                        {addressSuggestions.length > 0 && (
                          <Paper sx={{ position: 'absolute', width: '100%', zIndex: 10, mt: 1, maxHeight: 200, overflow: 'auto' }}>
                            {addressSuggestions.map((s, i) => (
                              <Box key={i} sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => handleSuggestionSelect(s)}>
                                <Typography variant="body2">{s.full_name}</Typography>
                              </Box>
                            ))}
                          </Paper>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Box ref={mapContainerRef} sx={{ height: 200, borderRadius: 2, mb: 1, border: '1px solid', borderColor: 'divider' }} />
                        <LocationButton onLocationFound={(c) => createUserMarker(mapglAPI, map, c)} />
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} mb={2}>Фотография</Typography>
                    <FileUploader files={files} onFilesChange={handleFilesChange} maxFiles={1}>
                      <Box sx={{ border: '2px dashed', borderColor: 'divider', p: 3, textAlign: 'center', borderRadius: 3, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.soft' } }}>
                        <CloudUploadIcon color="primary" sx={{ mb: 1 }} />
                        <Typography variant="body2" fontWeight={700}>Загрузить новое фото</Typography>
                      </Box>
                    </FileUploader>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 900, mt: 2 }}
                  >
                    {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Сохранить изменения'}
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Paper elevation={0} sx={{ borderRadius: 5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 3, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={900}>Редактор схемы</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <ParkingEditor parkingId={selectedParking.id} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      )}

      <ReviewsModal
        open={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        selectedParkingId={selectedParking?.id}
        parkingName={selectedParking?.name}
      />
    </Box>
  );
}
