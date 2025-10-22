import React, { useState, useEffect } from 'react';
import { Lottery } from '../../types';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminLotteries: React.FC = () => {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLottery, setNewLottery] = useState({
    name: '',
    code: '',
    type: 'single' as 'single' | 'double',
    description: '',
    price: 0,
    currency: 'USD',
    state: '',
    country: 'USA',
    officialWebsite: '',
    isActive: true,
    drawSchedule: [{ day: 'Monday', time: '22:00' }]
  });

  useEffect(() => {
    fetchLotteries();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchLotteries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await apiService.get(`/admin/lotteries?${params}`);
      if ((response as any).success) {
        setLotteries((response as any).data.lotteries);
        setTotalPages((response as any).data.pagination.pages);
      } else {
        setError('Failed to fetch lotteries');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch lotteries');
    } finally {
      setLoading(false);
    }
  };

  const handleLotteryAction = async (lotteryId: string, action: string) => {
    try {
      const response = await apiService.patch(`/admin/lotteries/${lotteryId}/${action}`);
      if ((response as any).success) {
        fetchLotteries();
        setShowModal(false);
        setSelectedLottery(null);
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
    }
  };

  const handleCreateLottery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lotteryData = {
        ...newLottery,
        price: parseFloat(newLottery.price.toString())
      };

      const response = await apiService.post('/admin/lotteries', lotteryData);
      if ((response as any).success) {
        setShowCreateModal(false);
        setNewLottery({
          name: '',
          code: '',
          type: 'single',
          description: '',
          price: 0,
          currency: 'USD',
          state: '',
          country: 'USA',
          officialWebsite: '',
          isActive: true,
          drawSchedule: [{ day: 'Monday', time: '22:00' }]
        });
        fetchLotteries();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create lottery');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLotteries();
  };

  const openLotteryModal = (lottery: Lottery) => {
    setSelectedLottery(lottery);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLottery(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewLottery({
      name: '',
      code: '',
      type: 'single',
      description: '',
      price: 0,
      currency: 'USD',
      state: '',
      country: 'USA',
      officialWebsite: '',
      isActive: true,
      drawSchedule: [{ day: 'Monday', time: '22:00' }]
    });
  };

  const addDrawSchedule = () => {
    setNewLottery({
      ...newLottery,
      drawSchedule: [...newLottery.drawSchedule, { day: 'Monday', time: '22:00' }]
    });
  };

  const removeDrawSchedule = (index: number) => {
    setNewLottery({
      ...newLottery,
      drawSchedule: newLottery.drawSchedule.filter((_, i) => i !== index)
    });
  };

  const updateDrawSchedule = (index: number, field: 'day' | 'time', value: string) => {
    const updatedSchedule = [...newLottery.drawSchedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setNewLottery({ ...newLottery, drawSchedule: updatedSchedule });
  };

  if (loading && lotteries.length === 0) {
    return (
      <div className="container py-5 mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading lotteries...</p>
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
            <h1 className="h3 mb-0">Lottery Management</h1>
            <div>
              <button 
                className="btn btn-success me-2" 
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Lottery
              </button>
              <button className="btn btn-outline-primary" onClick={fetchLotteries}>
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
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search lotteries by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
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

      {/* Lotteries Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Lotteries List</h6>
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
                      <th>Name</th>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>State/Country</th>
                      <th>Status</th>
                      <th>Last Draw</th>
                      <th>Next Draw</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotteries.map((lottery) => (
                      <tr key={lottery.id}>
                        <td>
                          <div>
                            <strong>{lottery.name}</strong>
                            <br />
                            <small className="text-muted">{lottery.description}</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">{lottery.code}</span>
                        </td>
                        <td>
                          <span className={`badge ${lottery.type === 'single' ? 'bg-primary' : 'bg-warning'}`}>
                            {lottery.type}
                          </span>
                        </td>
                        <td>${lottery.price.toFixed(2)} {lottery.currency}</td>
                        <td>
                          <div>
                            {lottery.state}
                            <br />
                            <small className="text-muted">{lottery.country}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${lottery.isActive ? 'bg-success' : 'bg-danger'}`}>
                            {lottery.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {lottery.lastDrawDate ? 
                            new Date(lottery.lastDrawDate).toLocaleDateString() : 
                            'N/A'
                          }
                        </td>
                        <td>
                          {lottery.nextDrawDate ? 
                            new Date(lottery.nextDrawDate).toLocaleDateString() : 
                            'N/A'
                          }
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openLotteryModal(lottery)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleLotteryAction(lottery.id, 'toggle-status')}
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
                <nav aria-label="Lotteries pagination">
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

      {/* Lottery Details Modal */}
      {showModal && selectedLottery && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Lottery Details</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Basic Information</h6>
                    <p><strong>Name:</strong> {selectedLottery.name}</p>
                    <p><strong>Code:</strong> {selectedLottery.code}</p>
                    <p><strong>Type:</strong> {selectedLottery.type}</p>
                    <p><strong>Price:</strong> ${selectedLottery.price.toFixed(2)} {selectedLottery.currency}</p>
                    <p><strong>State:</strong> {selectedLottery.state}</p>
                    <p><strong>Country:</strong> {selectedLottery.country}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Status & Dates</h6>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${selectedLottery.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {selectedLottery.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                    <p><strong>Last Draw:</strong> {selectedLottery.lastDrawDate ? new Date(selectedLottery.lastDrawDate).toLocaleString() : 'N/A'}</p>
                    <p><strong>Next Draw:</strong> {selectedLottery.nextDrawDate ? new Date(selectedLottery.nextDrawDate).toLocaleString() : 'N/A'}</p>
                    {selectedLottery.officialWebsite && (
                      <p><strong>Website:</strong> <a href={selectedLottery.officialWebsite} target="_blank" rel="noopener noreferrer">{selectedLottery.officialWebsite}</a></p>
                    )}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <h6>Description</h6>
                    <p>{selectedLottery.description}</p>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <h6>Draw Schedule</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Day</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedLottery.drawSchedule.map((schedule, index) => (
                            <tr key={index}>
                              <td>{schedule.day}</td>
                              <td>{schedule.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => handleLotteryAction(selectedLottery.id, 'toggle-status')}
                >
                  Toggle Status
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleLotteryAction(selectedLottery.id, 'delete')}
                >
                  Delete Lottery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Lottery Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Lottery</h5>
                <button type="button" className="btn-close" onClick={closeCreateModal}></button>
              </div>
              <form onSubmit={handleCreateLottery}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newLottery.name}
                          onChange={(e) => setNewLottery({...newLottery, name: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newLottery.code}
                          onChange={(e) => setNewLottery({...newLottery, code: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Type</label>
                        <select
                          className="form-select"
                          value={newLottery.type}
                          onChange={(e) => setNewLottery({...newLottery, type: e.target.value as 'single' | 'double'})}
                          required
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={newLottery.price}
                          onChange={(e) => setNewLottery({...newLottery, price: parseFloat(e.target.value)})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newLottery.state}
                          onChange={(e) => setNewLottery({...newLottery, state: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newLottery.country}
                          onChange={(e) => setNewLottery({...newLottery, country: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newLottery.description}
                      onChange={(e) => setNewLottery({...newLottery, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Official Website</label>
                    <input
                      type="url"
                      className="form-control"
                      value={newLottery.officialWebsite}
                      onChange={(e) => setNewLottery({...newLottery, officialWebsite: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Draw Schedule</label>
                    {newLottery.drawSchedule.map((schedule, index) => (
                      <div key={index} className="row mb-2">
                        <div className="col-md-6">
                          <select
                            className="form-select"
                            value={schedule.day}
                            onChange={(e) => updateDrawSchedule(index, 'day', e.target.value)}
                          >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <input
                            type="time"
                            className="form-control"
                            value={schedule.time}
                            onChange={(e) => updateDrawSchedule(index, 'time', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeDrawSchedule(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={addDrawSchedule}
                    >
                      <i className="bi bi-plus me-2"></i>
                      Add Schedule
                    </button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeCreateModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Create Lottery
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

export default AdminLotteries;
