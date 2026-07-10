import { useState, useEffect } from 'react';
import { Tag, Plus, Edit3, Trash2, X, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../lib/axios';
import { useToast } from '../contexts/ToastContext';

interface PricingPlan {
  id: number;
  name: string;
  price_small: number | null;
  price_regular: number | null;
  price_large: number | null;
  price_plus: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PricingPlanForm {
  name: string;
  price_small: string;
  price_regular: string;
  price_large: string;
  price_plus: string;
  description: string;
  is_active: boolean;
}

const initialFormState: PricingPlanForm = {
  name: '',
  price_small: '',
  price_regular: '',
  price_large: '',
  price_plus: '',
  description: '',
  is_active: true,
};

export default function PricingPlans() {
  const toast = useToast();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState<PricingPlanForm>(initialFormState);

  // Fetch plans on mount
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pricing-plans');
      setPlans(response.data.data);
    } catch (err: any) {
      toast.error('Failed to load pricing plans.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      price_small: plan.price_small !== null ? plan.price_small.toString() : '',
      price_regular: plan.price_regular !== null ? plan.price_regular.toString() : '',
      price_large: plan.price_large !== null ? plan.price_large.toString() : '',
      price_plus: plan.price_plus !== null ? plan.price_plus.toString() : '',
      description: plan.description || '',
      is_active: plan.is_active,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = () => {
    setForm((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning('Please provide a tier name.');
      return;
    }

    const payload = {
      name: form.name,
      price_small: form.price_small === '' ? null : parseFloat(form.price_small),
      price_regular: form.price_regular === '' ? null : parseFloat(form.price_regular),
      price_large: form.price_large === '' ? null : parseFloat(form.price_large),
      price_plus: form.price_plus === '' ? null : parseFloat(form.price_plus),
      description: form.description || null,
      is_active: form.is_active,
    };

    try {
      setSubmitLoading(true);
      if (editingPlan) {
        // Update plan
        const response = await api.put(`/pricing-plans/${editingPlan.id}`, payload);
        toast.success(response.data.message || 'Pricing plan updated successfully.');
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id ? response.data.data : p))
        );
      } else {
        // Create plan
        const response = await api.post('/pricing-plans', payload);
        toast.success(response.data.message || 'Pricing plan created successfully.');
        setPlans((prev) => [...prev, response.data.data]);
      }
      setIsModalOpen(false);
      setForm(initialFormState);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save pricing plan.';
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeletePlan = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the pricing plan "${name}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/pricing-plans/${id}`);
      toast.success(response.data.message || 'Pricing plan deleted successfully.');
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete pricing plan.');
      console.error(err);
    }
  };

  const togglePlanActiveState = async (plan: PricingPlan) => {
    const updatedStatus = !plan.is_active;
    try {
      // Optimistic update
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, is_active: updatedStatus } : p))
      );
      
      const payload = {
        name: plan.name,
        price_small: plan.price_small,
        price_regular: plan.price_regular,
        price_large: plan.price_large,
        price_plus: plan.price_plus,
        description: plan.description,
        is_active: updatedStatus,
      };

      await api.put(`/pricing-plans/${plan.id}`, payload);
      toast.success(`${plan.name} is now ${updatedStatus ? 'active' : 'inactive'}.`);
    } catch (err: any) {
      // Revert if error
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, is_active: !updatedStatus } : p))
      );
      toast.error('Failed to toggle active state.');
      console.error(err);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '—';
    return `₱${parseFloat(price.toString()).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="tab-pane fade-in-panel">
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Tag size={28} style={{ color: 'var(--color-primary)' }} />
          <div>
            <h1 style={{ margin: 0 }}>Baggage Pricing Plans</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Configure pricing categories (Small, Regular, Large, Plus) across different service tiers.
            </p>
          </div>
        </div>
        
        <button className="btn btn-primary" onClick={openAddModal} style={{ height: '42px', padding: '0 1.25rem' }}>
          <Plus size={18} style={{ marginRight: '6px' }} />
          Add Pricing Plan
        </button>
      </div>

      {loading ? (
        <div className="protected-loading">
          <div className="spinner">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeLinecap="round" />
            </svg>
          </div>
          <span>Loading pricing config...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border)' }}>
          <AlertTriangle size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.6 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Pricing Plans Configured</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Get started by defining your first storage pricing tier. You can input custom rates for all bag sizes.
          </p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="pricing-config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="pricing-card glass-panel"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.25s ease',
                border: plan.is_active ? '1px solid rgba(255, 56, 92, 0.15)' : '1px solid var(--border)',
                opacity: plan.is_active ? 1 : 0.7,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{plan.name}</h3>
                  <span
                    className={`pill-badge ${plan.is_active ? 'badge-completed' : 'badge-cancelled'}`}
                    style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '0.35rem', display: 'inline-block' }}
                  >
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <button
                  onClick={() => togglePlanActiveState(plan)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: plan.is_active ? 'var(--color-primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  title={plan.is_active ? 'Deactivate pricing plan' : 'Activate pricing plan'}
                >
                  {plan.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5', minHeight: '40px' }}>
                {plan.description || 'No description provided.'}
              </p>

              {/* Price category listing block */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                  Price Categories
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Small Size</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(plan.price_small)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Regular Size</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(plan.price_regular)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Large Size</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(plan.price_large)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Plus Size</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(plan.price_plus)}</strong>
                  </div>
                </div>
              </div>

              {/* Card actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <button className="btn btn-secondary" onClick={() => openEditModal(plan)} style={{ flex: 1, height: '38px', padding: 0 }}>
                  <Edit3 size={14} style={{ marginRight: '6px' }} />
                  Edit Plan
                </button>
                <button className="btn btn-danger" onClick={() => handleDeletePlan(plan.id, plan.name)} style={{ height: '38px', width: '38px', padding: 0, justifyContent: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add/Edit Dialog Modal ──────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div
            className="modal-content-card fade-in-panel glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '2.5rem',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
            }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              {editingPlan ? 'Edit Pricing Plan' : 'Add Pricing Plan'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {editingPlan
                ? 'Update the custom price rates and description for this tier.'
                : 'Define pricing details for a new baggage storage tier.'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Tier Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Standard Tier, Deluxe Tier"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Describe the plan benefits..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-sans)',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Price fields */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                  Category Prices (₱)
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Small Size Price</label>
                    <input
                      type="number"
                      name="price_small"
                      value={form.price_small}
                      onChange={handleInputChange}
                      placeholder="e.g. 50"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Regular Size Price</label>
                    <input
                      type="number"
                      name="price_regular"
                      value={form.price_regular}
                      onChange={handleInputChange}
                      placeholder="e.g. 100"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Large Size Price</label>
                    <input
                      type="number"
                      name="price_large"
                      value={form.price_large}
                      onChange={handleInputChange}
                      placeholder="e.g. 150"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Plus Size Price</label>
                    <input
                      type="number"
                      name="price_plus"
                      value={form.price_plus}
                      onChange={handleInputChange}
                      placeholder="e.g. 200"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle Option */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Plan Active Status</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show this plan as selectable/active</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: form.is_active ? 'var(--color-primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  {form.is_active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitLoading} style={{ flex: 1 }}>
                  {submitLoading ? 'Saving...' : editingPlan ? 'Save Changes' : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
