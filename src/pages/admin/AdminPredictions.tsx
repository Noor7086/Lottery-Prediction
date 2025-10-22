import React, { useState, useEffect } from 'react';
import { Prediction, LotteryType } from '../../types';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

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
  const [newPrediction, setNewPrediction] = useState({
    lotteryType: 'powerball' as LotteryType,
    lotteryDisplayName: '',
    drawDate: '',
    drawTime: '',
    nonViableNumbers: '',
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
    try {
      const response = await apiService.patch(`/admin/predictions/${predictionId}/${action}`);
      if ((response as any).success) {
        fetchPredictions();
        setShowModal(false);
        setSelectedPrediction(null);
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
    }
  };

  const handleCreatePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const predictionData = {
        ...newPrediction,
        nonViableNumbers: JSON.parse(newPrediction.nonViableNumbers || '[]'),
        price: parseFloat(newPrediction.price.toString())
      };

      const response = await apiService.post('/admin/predictions', predictionData);
      if ((response as any).success) {
        setShowCreateModal(false);
        setNewPrediction({
          lotteryType: 'powerball',
          lotteryDisplayName: '',
          drawDate: '',
          drawTime: '',
          nonViableNumbers: '',
          price: 0,
          notes: ''
        });
        fetchPredictions();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create prediction');
    }
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

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrediction(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewPrediction({
      lotteryType: 'powerball',
      lotteryDisplayName: '',
      drawDate: '',
      drawTime: '',
      nonViableNumbers: '',
      price: 0,
      notes: ''
    });
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
    <AdminLayout stats={{ totalPredictions: predictions.length }}>
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
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handlePredictionAction(prediction.id, 'toggle-status')}
                          >
                            <i className="bi bi-toggle-on"></i>
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
                    <h6>Non-Viable Numbers</h6>
                    <pre className="bg-light p-3 rounded">
                      {JSON.stringify(selectedPrediction.nonViableNumbers, null, 2)}
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
                  className="btn btn-warning"
                  onClick={() => handlePredictionAction(selectedPrediction.id, 'toggle-status')}
                >
                  Toggle Status
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
          <div className="modal-dialog modal-lg">
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
                          onChange={(e) => setNewPrediction({...newPrediction, lotteryType: e.target.value as LotteryType})}
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
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Non-Viable Numbers (JSON)</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={newPrediction.nonViableNumbers}
                          onChange={(e) => setNewPrediction({...newPrediction, nonViableNumbers: e.target.value})}
                          placeholder='{"whiteBalls": [1, 2, 3], "redBalls": [1, 2]}'
                        />
                      </div>
                    </div>
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
      </div>
    </AdminLayout>
  );
};

export default AdminPredictions;

