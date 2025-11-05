import React, { useState, useEffect } from 'react';
import { Prediction, LotteryType } from '../../types';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import toast from 'react-hot-toast';

const AdminPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLottery, setFilterLottery] = useState<LotteryType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState<Prediction | null>(null);
  const [togglingPredictionId, setTogglingPredictionId] = useState<string | null>(null);
  // Lottery configurations with pick limits
  const lotteryConfigs = {
    powerball: {
      whiteBalls: { min: 1, max: 69, pickCount: 5, label: 'White Balls (1-69) - Select exactly 5' },
      redBalls: { min: 1, max: 26, pickCount: 1, label: 'Red Ball / Powerball (1-26) - Select exactly 1' },
      type: 'double' as const
    },
    megamillion: {
      whiteBalls: { min: 1, max: 70, pickCount: 5, label: 'White Balls (1-70) - Select exactly 5' },
      redBalls: { min: 1, max: 25, pickCount: 1, label: 'Mega Ball (1-25) - Select exactly 1' },
      type: 'double' as const
    },
    lottoamerica: {
      whiteBalls: { min: 1, max: 52, pickCount: 5, label: 'White Balls (1-52) - Select exactly 5' },
      redBalls: { min: 1, max: 10, pickCount: 1, label: 'Star Ball (1-10) - Select exactly 1' },
      type: 'double' as const
    },
    gopher5: {
      numbers: { min: 1, max: 47, pickCount: 5, label: 'Numbers (1-47) - Select exactly 5' },
      type: 'single' as const
    },
    pick3: {
      numbers: { min: 0, max: 9, pickCount: 3, label: 'Numbers (0-9) - Select exactly 3' },
      type: 'pick3' as const
    }
  };

  const [newPrediction, setNewPrediction] = useState({
    lotteryType: 'powerball' as LotteryType,
    lotteryDisplayName: '',
    drawDate: '',
    drawTime: '',
    whiteBalls: [] as number[],
    redBalls: [] as number[],
    singleNumbers: [] as number[],
    pick3Numbers: [] as number[],
    price: 0,
    notes: ''
  });

  const lotteryTypes: { value: LotteryType; label: string }[] = [
    { value: 'powerball', label: 'Powerball' },
    { value: 'megamillion', label: 'Mega Millions' },
    { value: 'lottoamerica', label: 'Lotto America' },
    { value: 'pick3', label: 'Pick 3' },
    { value: 'gopher5', label: 'Gopher 5' }
  ];

  useEffect(() => {
    fetchPredictions();
  }, [currentPage, searchTerm, filterLottery, filterStatus]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterLottery !== 'all' && { lotteryType: filterLottery }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await apiService.get(`/admin/predictions?${params}`);
      if ((response as any).success) {
        setPredictions((response as any).data.predictions);
        setTotalPages((response as any).data.pagination.pages);
      } else {
        setError('Failed to fetch predictions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionAction = async (predictionId: string, action: string) => {
    // Validate predictionId before making request
    if (!predictionId || predictionId === 'undefined' || predictionId === 'null') {
      toast.error('Invalid prediction ID');
      console.error('Invalid predictionId:', predictionId);
      return;
    }

    try {
      setTogglingPredictionId(predictionId);
      setError(null);
      
      console.log('Toggling prediction status:', { predictionId, action });
      
      const response = await apiService.patch(`/admin/predictions/${predictionId}/${action}`);
      
      if ((response as any).success) {
        const message = (response as any).message || `Prediction ${action === 'toggle-status' ? 'status updated' : action === 'delete' ? 'deleted' : 'updated'} successfully`;
        toast.success(message);
        
        // Update the prediction in the local state immediately for better UX
        if (action === 'toggle-status') {
          const newIsActive = (response as any).data?.isActive;
          setPredictions(prevPredictions => 
            prevPredictions.map(prediction => 
              prediction.id === predictionId 
                ? { ...prediction, isActive: newIsActive !== undefined ? newIsActive : (prediction.isActive === undefined ? true : !prediction.isActive) }
                : prediction
            )
          );
          // Update selected prediction if modal is open
          if (selectedPrediction && selectedPrediction.id === predictionId) {
            setSelectedPrediction({ ...selectedPrediction, isActive: newIsActive !== undefined ? newIsActive : (selectedPrediction.isActive === undefined ? true : !selectedPrediction.isActive) });
          }
        } else if (action === 'delete') {
          setPredictions(prevPredictions => prevPredictions.filter(prediction => prediction.id !== predictionId));
          setShowModal(false);
          setSelectedPrediction(null);
        }
        
        // Refresh the list to ensure consistency
        fetchPredictions();
        if (action !== 'toggle-status') {
          setShowModal(false);
          setSelectedPrediction(null);
        }
      } else {
        const errorMessage = (response as any).message || 'Action failed';
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Error toggling prediction status:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Action failed';
      setError(errorMessage);
      
      // Show more detailed error if available
      if (err.response?.data?.errors) {
        const errors = Array.isArray(err.response.data.errors) 
          ? err.response.data.errors.map((e: any) => e.message || e.msg).join(', ')
          : err.response.data.errors;
        toast.error(errors || errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setTogglingPredictionId(null);
    }
  };

  const handleCreatePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPrediction(false);
  };

  const handleUpdatePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrediction) return;
    await submitPrediction(true);
  };

  const submitPrediction = async (isEdit: boolean) => {
    // Validate number selections
    const config = lotteryConfigs[newPrediction.lotteryType];
    let validationError = '';
    
    if (config.type === 'double') {
      if (newPrediction.whiteBalls.length !== config.whiteBalls.pickCount) {
        validationError = `Please select exactly ${config.whiteBalls.pickCount} white balls`;
      } else if (newPrediction.redBalls.length !== config.redBalls.pickCount) {
        validationError = `Please select exactly ${config.redBalls.pickCount} ${config.redBalls.pickCount === 1 ? 'red ball' : 'red balls'}`;
      }
    } else if (config.type === 'single') {
      if (newPrediction.singleNumbers.length !== config.numbers.pickCount) {
        validationError = `Please select exactly ${config.numbers.pickCount} numbers`;
      }
    } else if (config.type === 'pick3') {
      if (newPrediction.pick3Numbers.length !== config.numbers.pickCount) {
        validationError = `Please select exactly ${config.numbers.pickCount} numbers`;
      }
    }
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      // Combine date and time into ISO8601 datetime string
      const drawDateTime = new Date(`${newPrediction.drawDate}T${newPrediction.drawTime}`).toISOString();
      
      const predictionData: any = {
        lotteryType: newPrediction.lotteryType,
        lotteryDisplayName: newPrediction.lotteryDisplayName,
        drawDate: drawDateTime,
        drawTime: newPrediction.drawTime,
        price: parseFloat(newPrediction.price.toString()),
        notes: newPrediction.notes || undefined
      };

      // Format viable numbers based on lottery type (these are the recommended numbers)
      if (config.type === 'double') {
        const whiteBalls = newPrediction.whiteBalls.filter(n => n != null && !isNaN(n));
        const redBalls = newPrediction.redBalls.filter(n => n != null && !isNaN(n));
        predictionData.viableNumbers = {
          whiteBalls: whiteBalls,
          redBalls: redBalls
        };
        console.log('📤 FRONTEND - Sending viableNumbers:', JSON.stringify(predictionData.viableNumbers, null, 2));
        console.log('📤 FRONTEND - White balls array:', whiteBalls);
        console.log('📤 FRONTEND - Red balls array:', redBalls);
      } else if (config.type === 'single') {
        const numbers = newPrediction.singleNumbers.filter(n => n != null && !isNaN(n));
        predictionData.viableNumbersSingle = numbers;
        console.log('📤 FRONTEND - Sending viableNumbersSingle:', numbers);
      } else if (config.type === 'pick3') {
        const numbers = newPrediction.pick3Numbers.filter(n => n != null && !isNaN(n));
        predictionData.viableNumbersPick3 = numbers;
        console.log('📤 FRONTEND - Sending viableNumbersPick3:', numbers);
      }

      console.log('📤 FRONTEND - Full predictionData being sent:', JSON.stringify(predictionData, null, 2));

      if (isEdit && editingPrediction) {
        // Update existing prediction
        const response = await apiService.put(`/admin/predictions/${editingPrediction.id}`, predictionData);
        if ((response as any).success) {
          setShowEditModal(false);
          setEditingPrediction(null);
          resetPredictionForm();
          fetchPredictions();
          setError(null);
          toast.success('Prediction updated successfully!');
        }
      } else {
        // Create new prediction
        const response = await apiService.post('/admin/predictions', predictionData);
        if ((response as any).success) {
          setShowCreateModal(false);
          resetPredictionForm();
          fetchPredictions();
          setError(null);
          toast.success('Prediction created successfully!');
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || `Failed to ${isEdit ? 'update' : 'create'} prediction`;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const resetPredictionForm = () => {
    setNewPrediction({
      lotteryType: 'powerball',
      lotteryDisplayName: '',
      drawDate: '',
      drawTime: '',
      whiteBalls: [],
      redBalls: [],
      singleNumbers: [],
      pick3Numbers: [],
      price: 0,
      notes: ''
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPredictions();
  };

  const openPredictionModal = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    setShowModal(true);
  };

  const openEditModal = (prediction: Prediction) => {
    setEditingPrediction(prediction);
    
    // Extract non-viable numbers based on lottery type
    // The admin endpoint returns raw MongoDB documents with separate fields
    const config = lotteryConfigs[prediction.lotteryType];
    const predAny = prediction as any; // Access raw fields
    let whiteBalls: number[] = [];
    let redBalls: number[] = [];
    let singleNumbers: number[] = [];
    let pick3Numbers: number[] = [];

    // Handle the viableNumbers data structure from raw model (preferred), fall back to nonViableNumbers (legacy)
    if (config.type === 'double') {
      // Check viableNumbers first (new format), then fall back to nonViableNumbers (legacy)
      if (predAny.viableNumbers && typeof predAny.viableNumbers === 'object') {
        whiteBalls = Array.isArray(predAny.viableNumbers.whiteBalls) 
          ? predAny.viableNumbers.whiteBalls 
          : [];
        redBalls = Array.isArray(predAny.viableNumbers.redBalls) 
          ? predAny.viableNumbers.redBalls 
          : [];
      } else if (predAny.nonViableNumbers && typeof predAny.nonViableNumbers === 'object') {
        // Legacy support
        whiteBalls = Array.isArray(predAny.nonViableNumbers.whiteBalls) 
          ? predAny.nonViableNumbers.whiteBalls 
          : [];
        redBalls = Array.isArray(predAny.nonViableNumbers.redBalls) 
          ? predAny.nonViableNumbers.redBalls 
          : [];
      }
    } else if (config.type === 'single') {
      // Check viableNumbersSingle first, then fall back to nonViableNumbersSingle (legacy)
      if (Array.isArray(predAny.viableNumbersSingle)) {
        singleNumbers = predAny.viableNumbersSingle;
      } else if (Array.isArray(predAny.nonViableNumbersSingle)) {
        singleNumbers = predAny.nonViableNumbersSingle;
      }
    } else if (config.type === 'pick3') {
      // Check viableNumbersPick3 first, then fall back to nonViableNumbersPick3 (legacy)
      if (Array.isArray(predAny.viableNumbersPick3)) {
        pick3Numbers = predAny.viableNumbersPick3;
      } else if (Array.isArray(predAny.nonViableNumbersPick3)) {
        pick3Numbers = predAny.nonViableNumbersPick3;
      }
    }

    // Format date and time for input fields
    const drawDate = new Date(prediction.drawDate);
    const formattedDate = drawDate.toISOString().split('T')[0];
    const formattedTime = prediction.drawTime || '';

    setNewPrediction({
      lotteryType: prediction.lotteryType,
      lotteryDisplayName: prediction.lotteryDisplayName || '',
      drawDate: formattedDate,
      drawTime: formattedTime,
      whiteBalls,
      redBalls,
      singleNumbers,
      pick3Numbers,
      price: prediction.price,
      notes: prediction.notes || ''
    });

    setShowEditModal(true);
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrediction(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetPredictionForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPrediction(null);
    resetPredictionForm();
  };

  const toggleNumber = (number: number, type: 'whiteBalls' | 'redBalls' | 'singleNumbers' | 'pick3Numbers') => {
    setNewPrediction(prev => {
      const currentNumbers = prev[type];
      const isSelected = currentNumbers.includes(number);
      
      return {
        ...prev,
        [type]: isSelected
          ? currentNumbers.filter(n => n !== number)
          : [...currentNumbers, number].sort((a, b) => a - b)
      };
    });
  };

  const clearNumbers = (type: 'whiteBalls' | 'redBalls' | 'singleNumbers' | 'pick3Numbers') => {
    setNewPrediction(prev => ({
      ...prev,
      [type]: []
    }));
  };

  const NumberSelector: React.FC<{
    min: number;
    max: number;
    selected: number[];
    onToggle: (num: number) => void;
    onClear: () => void;
    label: string;
    requiredCount: number;
  }> = ({ min, max, selected, onToggle, onClear, label, requiredCount }) => {
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const isLimitReached = selected.length >= requiredCount;
    const isValid = selected.length === requiredCount;
    
    return (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label fw-bold">{label}</label>
          <div>
            <span className={`badge me-2 ${isValid ? 'bg-success' : isLimitReached ? 'bg-warning' : 'bg-info'}`}>
              Selected: {selected.length} / {requiredCount} {isValid ? '✓' : ''}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onClear}
              disabled={selected.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>
        {!isValid && (
          <div className={`alert alert-${isLimitReached ? 'warning' : 'info'} py-2 mb-2`} role="alert">
            <small>
              {isLimitReached 
                ? `You have selected ${selected.length} numbers. Maximum allowed is ${requiredCount}. Please deselect some numbers.`
                : `Please select exactly ${requiredCount} ${requiredCount === 1 ? 'number' : 'numbers'}. Currently selected: ${selected.length}`
              }
            </small>
          </div>
        )}
        <div
          className="border rounded p-3"
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}
        >
          <div className="d-flex flex-wrap gap-2">
            {numbers.map(num => {
              const isSelected = selected.includes(num);
              const isDisabled = !isSelected && isLimitReached;
              
              return (
                <button
                  key={num}
                  type="button"
                  className={`btn ${isSelected ? 'btn-primary' : isDisabled ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  style={{
                    minWidth: '50px',
                    fontSize: '0.9rem',
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => !isDisabled && onToggle(num)}
                  disabled={isDisabled}
                  title={isDisabled ? `Maximum of ${requiredCount} selections allowed` : isSelected ? 'Click to deselect' : 'Click to select'}
                >
                  {num.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
        {selected.length > 0 && (
          <div className="mt-2">
            <small className={`${isValid ? 'text-success fw-bold' : 'text-muted'}`}>
              Selected: {selected.join(', ')}
              {!isValid && ` (Need ${requiredCount - selected.length} more)`}
            </small>
          </div>
        )}
      </div>
    );
  };

  if (loading && predictions.length === 0) {
    return (
      <div className="container py-5 mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Prediction Management</h1>
            <div>
              <button 
                className="btn btn-success me-2" 
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Prediction
              </button>
              <button className="btn btn-outline-primary" onClick={fetchPredictions}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-body">
              <form onSubmit={handleSearch} className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search predictions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterLottery}
                    onChange={(e) => setFilterLottery(e.target.value as LotteryType | 'all')}
                  >
                    <option value="all">All Lotteries</option>
                    {lotteryTypes.map((lottery) => (
                      <option key={lottery.value} value={lottery.value}>
                        {lottery.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary w-100">
                    <i className="bi bi-search me-2"></i>
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Predictions List</h6>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-bordered" width="100%" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>Lottery</th>
                      <th>Draw Date</th>
                      <th>Price</th>
                      <th>Downloads</th>
                      <th>Purchases</th>
                      <th>Accuracy</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((prediction) => (
                      <tr key={prediction.id}>
                        <td>
                          <div>
                            <strong>{prediction.lotteryDisplayName}</strong>
                            <br />
                            <small className="text-muted">{prediction.lotteryType}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            {new Date(prediction.drawDate).toLocaleDateString()}
                            <br />
                            <small className="text-muted">{prediction.drawTime}</small>
                          </div>
                        </td>
                        <td>${prediction.price.toFixed(2)}</td>
                        <td>{prediction.downloadCount}</td>
                        <td>{prediction.purchaseCount}</td>
                        <td>
                          {prediction.accuracy ? (
                            <span className="badge bg-success">
                              {prediction.accuracy.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="badge bg-secondary">N/A</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${prediction.isActive ? 'bg-success' : 'bg-danger'}`}>
                            {prediction.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(prediction.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openPredictionModal(prediction)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success me-2"
                            onClick={() => openEditModal(prediction)}
                            title="Edit Prediction"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className={`btn btn-sm ${!prediction.isActive ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            onClick={() => {
                              const predictionId = prediction.id;
                              if (predictionId) {
                                handlePredictionAction(predictionId, 'toggle-status');
                              } else {
                                console.error('Prediction ID not found:', prediction);
                                toast.error('Prediction ID is missing');
                              }
                            }}
                            disabled={togglingPredictionId === prediction.id || !prediction.id}
                            title={!prediction.isActive ? 'Activate Prediction' : 'Deactivate Prediction'}
                          >
                            {togglingPredictionId === prediction.id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className={`bi ${!prediction.isActive ? 'bi-toggle-off' : 'bi-toggle-on'}`}></i>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Predictions pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Details Modal */}
      {showModal && selectedPrediction && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Prediction Details</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Prediction Information</h6>
                    <p><strong>Lottery:</strong> {selectedPrediction.lotteryDisplayName}</p>
                    <p><strong>Type:</strong> {selectedPrediction.lotteryType}</p>
                    <p><strong>Draw Date:</strong> {new Date(selectedPrediction.drawDate).toLocaleDateString()}</p>
                    <p><strong>Draw Time:</strong> {selectedPrediction.drawTime}</p>
                    <p><strong>Price:</strong> ${selectedPrediction.price.toFixed(2)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Statistics</h6>
                    <p><strong>Downloads:</strong> {selectedPrediction.downloadCount}</p>
                    <p><strong>Purchases:</strong> {selectedPrediction.purchaseCount}</p>
                    <p><strong>Accuracy:</strong> {selectedPrediction.accuracy ? `${selectedPrediction.accuracy.toFixed(1)}%` : 'N/A'}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${selectedPrediction.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {selectedPrediction.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <h6>Recommended Viable Numbers</h6>
                    <pre className="bg-light p-3 rounded">
                      {JSON.stringify(selectedPrediction.viableNumbers || selectedPrediction.nonViableNumbers, null, 2)}
                    </pre>
                  </div>
                </div>
                {selectedPrediction.notes && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <h6>Notes</h6>
                      <p>{selectedPrediction.notes}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success me-2"
                  onClick={() => {
                    closeModal();
                    openEditModal(selectedPrediction);
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit
                </button>
                <button
                  type="button"
                  className={`btn me-2 ${!selectedPrediction.isActive ? 'btn-success' : 'btn-warning'}`}
                  onClick={() => {
                    const predictionId = selectedPrediction.id;
                    if (predictionId) {
                      handlePredictionAction(predictionId, 'toggle-status');
                    } else {
                      console.error('Selected prediction ID not found:', selectedPrediction);
                      toast.error('Prediction ID is missing');
                    }
                  }}
                  disabled={togglingPredictionId === selectedPrediction.id || !selectedPrediction.id}
                >
                  {togglingPredictionId === selectedPrediction.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className={`bi me-2 ${!selectedPrediction.isActive ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                      {!selectedPrediction.isActive ? 'Activate Prediction' : 'Deactivate Prediction'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handlePredictionAction(selectedPrediction.id, 'delete')}
                >
                  Delete Prediction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Prediction Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Prediction</h5>
                <button type="button" className="btn-close" onClick={closeCreateModal}></button>
              </div>
              <form onSubmit={handleCreatePrediction}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Lottery Type</label>
                        <select
                          className="form-select"
                          value={newPrediction.lotteryType}
                          onChange={(e) => {
                            const newType = e.target.value as LotteryType;
                            const lotteryName = lotteryTypes.find(lt => lt.value === newType)?.label || '';
                            setNewPrediction({
                              ...newPrediction,
                              lotteryType: newType,
                              lotteryDisplayName: lotteryName,
                              // Clear numbers when type changes
                              whiteBalls: [],
                              redBalls: [],
                              singleNumbers: [],
                              pick3Numbers: []
                            });
                          }}
                          required
                        >
                          {lotteryTypes.map((lottery) => (
                            <option key={lottery.value} value={lottery.value}>
                              {lottery.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Display Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newPrediction.lotteryDisplayName}
                          onChange={(e) => setNewPrediction({...newPrediction, lotteryDisplayName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Draw Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={newPrediction.drawDate}
                          onChange={(e) => setNewPrediction({...newPrediction, drawDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Draw Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newPrediction.drawTime}
                          onChange={(e) => setNewPrediction({...newPrediction, drawTime: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={newPrediction.price}
                          onChange={(e) => setNewPrediction({...newPrediction, price: parseFloat(e.target.value)})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Number Selection Interface */}
                  <div className="mb-3">
                    <h6 className="mb-3">Select Recommended Viable Numbers</h6>
                    <p className="text-muted small mb-3">
                      Select the recommended numbers for this prediction. These are the numbers that players should use.
                    </p>
                    
                    {(() => {
                      const config = lotteryConfigs[newPrediction.lotteryType];
                      
                      if (config.type === 'double') {
                        return (
                          <>
                            <NumberSelector
                              min={config.whiteBalls.min}
                              max={config.whiteBalls.max}
                              selected={newPrediction.whiteBalls}
                              onToggle={(num) => toggleNumber(num, 'whiteBalls')}
                              onClear={() => clearNumbers('whiteBalls')}
                              label={config.whiteBalls.label}
                              requiredCount={config.whiteBalls.pickCount}
                            />
                            <NumberSelector
                              min={config.redBalls.min}
                              max={config.redBalls.max}
                              selected={newPrediction.redBalls}
                              onToggle={(num) => toggleNumber(num, 'redBalls')}
                              onClear={() => clearNumbers('redBalls')}
                              label={config.redBalls.label}
                              requiredCount={config.redBalls.pickCount}
                            />
                          </>
                        );
                      } else if (config.type === 'single') {
                        return (
                          <NumberSelector
                            min={config.numbers.min}
                            max={config.numbers.max}
                            selected={newPrediction.singleNumbers}
                            onToggle={(num) => toggleNumber(num, 'singleNumbers')}
                            onClear={() => clearNumbers('singleNumbers')}
                            label={config.numbers.label}
                            requiredCount={config.numbers.pickCount}
                          />
                        );
                      } else if (config.type === 'pick3') {
                        return (
                          <NumberSelector
                            min={config.numbers.min}
                            max={config.numbers.max}
                            selected={newPrediction.pick3Numbers}
                            onToggle={(num) => toggleNumber(num, 'pick3Numbers')}
                            onClear={() => clearNumbers('pick3Numbers')}
                            label={config.numbers.label}
                            requiredCount={config.numbers.pickCount}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newPrediction.notes}
                      onChange={(e) => setNewPrediction({...newPrediction, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeCreateModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Create Prediction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prediction Modal */}
      {showEditModal && editingPrediction && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Prediction</h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>
              <form onSubmit={handleUpdatePrediction}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Lottery Type</label>
                        <select
                          className="form-select"
                          value={newPrediction.lotteryType}
                          onChange={(e) => {
                            const newType = e.target.value as LotteryType;
                            const lotteryName = lotteryTypes.find(lt => lt.value === newType)?.label || '';
                            setNewPrediction({
                              ...newPrediction,
                              lotteryType: newType,
                              lotteryDisplayName: lotteryName,
                              // Clear numbers when type changes
                              whiteBalls: [],
                              redBalls: [],
                              singleNumbers: [],
                              pick3Numbers: []
                            });
                          }}
                          required
                        >
                          {lotteryTypes.map((lottery) => (
                            <option key={lottery.value} value={lottery.value}>
                              {lottery.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Display Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newPrediction.lotteryDisplayName}
                          onChange={(e) => setNewPrediction({...newPrediction, lotteryDisplayName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Draw Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={newPrediction.drawDate}
                          onChange={(e) => setNewPrediction({...newPrediction, drawDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Draw Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newPrediction.drawTime}
                          onChange={(e) => setNewPrediction({...newPrediction, drawTime: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={newPrediction.price}
                          onChange={(e) => setNewPrediction({...newPrediction, price: parseFloat(e.target.value)})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Number Selection Interface */}
                  <div className="mb-3">
                    <h6 className="mb-3">Select Recommended Viable Numbers</h6>
                    <p className="text-muted small mb-3">
                      Select the recommended numbers for this prediction. These are the numbers that players should use.
                    </p>
                    
                    {(() => {
                      const config = lotteryConfigs[newPrediction.lotteryType];
                      
                      if (config.type === 'double') {
                        return (
                          <>
                            <NumberSelector
                              min={config.whiteBalls.min}
                              max={config.whiteBalls.max}
                              selected={newPrediction.whiteBalls}
                              onToggle={(num) => toggleNumber(num, 'whiteBalls')}
                              onClear={() => clearNumbers('whiteBalls')}
                              label={config.whiteBalls.label}
                              requiredCount={config.whiteBalls.pickCount}
                            />
                            <NumberSelector
                              min={config.redBalls.min}
                              max={config.redBalls.max}
                              selected={newPrediction.redBalls}
                              onToggle={(num) => toggleNumber(num, 'redBalls')}
                              onClear={() => clearNumbers('redBalls')}
                              label={config.redBalls.label}
                              requiredCount={config.redBalls.pickCount}
                            />
                          </>
                        );
                      } else if (config.type === 'single') {
                        return (
                          <NumberSelector
                            min={config.numbers.min}
                            max={config.numbers.max}
                            selected={newPrediction.singleNumbers}
                            onToggle={(num) => toggleNumber(num, 'singleNumbers')}
                            onClear={() => clearNumbers('singleNumbers')}
                            label={config.numbers.label}
                            requiredCount={config.numbers.pickCount}
                          />
                        );
                      } else if (config.type === 'pick3') {
                        return (
                          <NumberSelector
                            min={config.numbers.min}
                            max={config.numbers.max}
                            selected={newPrediction.pick3Numbers}
                            onToggle={(num) => toggleNumber(num, 'pick3Numbers')}
                            onClear={() => clearNumbers('pick3Numbers')}
                            label={config.numbers.label}
                            requiredCount={config.numbers.pickCount}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newPrediction.notes}
                      onChange={(e) => setNewPrediction({...newPrediction, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Update Prediction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminPredictions;

