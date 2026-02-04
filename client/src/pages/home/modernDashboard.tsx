import { useState, useMemo } from "react";
import { useList, useUpdate } from "@refinedev/core";
import { Card, Progress, Row, Col, Typography, Tag, Empty, Spin, Input, Space, Alert, Button, message } from "antd";
import { 
  DatabaseOutlined, 
  ExperimentOutlined,
  ShopOutlined,
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  EuroOutlined,
  ScanOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import "./modernDashboard.css";

const { Title, Text } = Typography;

interface Filament {
  id: number;
  name: string;
  material: string;
  color_hex: string;
  price?: number;
  vendor?: {
    name: string;
  };
}

interface Spool {
  id: number;
  filament: Filament;
  remaining_weight: number;
  initial_weight: number;
  location?: string;
  comment?: string;
  extra?: {
    source?: string;
    needs_verification?: string;
    [key: string]: string | undefined;
  };
}

const SpoolCard = ({ spool, onClick }: { spool: Spool; onClick: () => void }) => {
  const remaining = spool.remaining_weight || 0;
  const initial = spool.initial_weight || 1000;
  const percent = Math.round((remaining / initial) * 100);
  const colorHex = spool.filament?.color_hex || "808080";
  const price = spool.filament?.price;
  const cost = price ? ((remaining / 1000) * price).toFixed(2) : null;
  
  const getStatusColor = (pct: number) => {
    if (pct > 50) return "#52c41a";
    if (pct > 20) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Card 
      className="spool-card"
      onClick={onClick}
      style={{ 
        borderLeft: `4px solid #${colorHex}`,
        marginBottom: 12
      }}
    >
      <div className="spool-card-content">
        <div 
          className="spool-color-indicator"
          style={{ backgroundColor: `#${colorHex}` }}
        />
        <div className="spool-info">
          <Text strong className="spool-name">
            {spool.filament?.name || "Sin nombre"}
          </Text>
          <Text type="secondary" className="spool-material">
            {spool.filament?.material} • {spool.filament?.vendor?.name}
          </Text>
          {spool.location && (
            <Text type="secondary" className="spool-location">
              <EnvironmentOutlined /> {spool.location}
            </Text>
          )}
          <div className="spool-progress">
            <Progress 
              percent={percent} 
              size="small"
              strokeColor={getStatusColor(percent)}
              format={() => `${remaining}g`}
            />
          </div>
          {cost && (
            <Text type="secondary" className="spool-cost">
              ~{cost}€ restante
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};

// Card for spools added from invoice that need to be scanned
const UnverifiedSpoolCard = ({ 
  spool, 
  onConfirm 
}: { 
  spool: Spool; 
  onConfirm: () => void;
}) => {
  const colorHex = spool.filament?.color_hex || "808080";
  
  return (
    <Card 
      className="unverified-spool-card"
      style={{ marginBottom: 16 }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div 
          style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 12,
            backgroundColor: `#${colorHex}`,
            border: '2px solid rgba(0,0,0,0.15)',
            flexShrink: 0
          }} 
        />
        <div style={{ flex: 1 }}>
          <Text strong style={{ fontSize: 16 }}>
            {spool.filament?.name}
          </Text>
          <br />
          <Text type="secondary">
            {spool.filament?.material} • {spool.filament?.vendor?.name}
          </Text>
          
          <div style={{ 
            background: 'rgba(250, 173, 20, 0.1)', 
            borderRadius: 8, 
            padding: '8px 12px',
            marginTop: 8
          }}>
            <Text style={{ fontSize: 13 }}>
              📦 <strong>Añadido desde factura</strong>
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Escanea este carrete con BambuMan para confirmar que lo tienes físicamente.
            </Text>
          </div>
          
          <Button 
            type="primary"
            icon={<ScanOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            style={{ marginTop: 12, width: '100%' }}
          >
            ✓ Ya lo escaneé
          </Button>
        </div>
      </div>
    </Card>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color,
  subtitle,
  onClick 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}) => (
  <Card 
    className="stat-card" 
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    <div className="stat-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="stat-content">
      <Text className="stat-value">{value}</Text>
      <Text type="secondary" className="stat-title">{title}</Text>
      {subtitle && <Text type="secondary" className="stat-subtitle">{subtitle}</Text>}
    </div>
  </Card>
);

const FilterChip = ({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) => (
  <Tag 
    className={`filter-chip ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    {label}
  </Tag>
);

export const ModernDashboard = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [materialFilter, setMaterialFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  
  const { result: spoolsResult, query: spoolsQuery } = useList<Spool>({
    resource: "spool",
    pagination: { mode: "off" },
  });

  const { result: filamentsResult } = useList<Filament>({
    resource: "filament",
    pagination: { mode: "off" },
  });

  const { mutate: updateSpool } = useUpdate();

  const { result: vendorsResult } = useList({
    resource: "vendor",
    pagination: { mode: "off" },
  });

  const spoolsLoading = spoolsQuery.isLoading;
  const spools: Spool[] = spoolsResult?.data || [];
  const filaments: Filament[] = filamentsResult?.data || [];
  const vendors = vendorsResult?.data || [];

  // Handle confirming a spool has been scanned
  const handleConfirmSpool = (spoolId: number) => {
    updateSpool(
      {
        resource: "spool",
        id: spoolId,
        values: { 
          comment: "",  // Clear the comment
        },
      },
      {
        onSuccess: () => {
          message.success("✅ Carrete verificado");
          spoolsQuery.refetch();
        },
        onError: () => {
          message.error("Error al actualizar");
        },
      }
    );
  };

  // Get unique materials and locations for filters
  const materials = useMemo(() => {
    const mats = new Set(spools.map(s => s.filament?.material).filter((m): m is string => Boolean(m)));
    return Array.from(mats).sort();
  }, [spools]);

  const locations = useMemo(() => {
    const locs = new Set(spools.map(s => s.location).filter((l): l is string => Boolean(l)));
    return Array.from(locs).sort();
  }, [spools]);

  // Filter spools
  const filteredSpools = useMemo(() => {
    return spools.filter(spool => {
      // Search filter
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchesName = spool.filament?.name?.toLowerCase().includes(search);
        const matchesMaterial = spool.filament?.material?.toLowerCase().includes(search);
        const matchesVendor = spool.filament?.vendor?.name?.toLowerCase().includes(search);
        const matchesLocation = spool.location?.toLowerCase().includes(search);
        if (!matchesName && !matchesMaterial && !matchesVendor && !matchesLocation) {
          return false;
        }
      }
      // Material filter
      if (materialFilter && spool.filament?.material !== materialFilter) {
        return false;
      }
      // Location filter
      if (locationFilter && spool.location !== locationFilter) {
        return false;
      }
      return true;
    });
  }, [spools, searchText, materialFilter, locationFilter]);

  // Calculate stats
  const totalWeight = spools.reduce((sum: number, s: Spool) => sum + (s.remaining_weight || 0), 0);
  const totalValue = spools.reduce((sum: number, s: Spool) => {
    const price = s.filament?.price || 0;
    const remaining = s.remaining_weight || 0;
    return sum + (remaining / 1000) * price;
  }, 0);
  const lowStockSpools = spools.filter((s: Spool) => {
    const pct = ((s.remaining_weight || 0) / (s.initial_weight || 1000)) * 100;
    return pct < 20;
  });

  // Spools that need verification (added from invoice, not scanned)
  const unverifiedSpools = spools.filter((s: Spool) => 
    s.extra?.needs_verification === "true" || s.comment?.includes("[PENDIENTE ESCANEAR]")
  );

  // Group filtered spools by material
  const spoolsByMaterial = filteredSpools.reduce((acc: Record<string, Spool[]>, spool: Spool) => {
    const material = spool.filament?.material || "Otro";
    if (!acc[material]) acc[material] = [];
    acc[material].push(spool);
    return acc;
  }, {} as Record<string, Spool[]>);

  const clearFilters = () => {
    setSearchText("");
    setMaterialFilter(null);
    setLocationFilter(null);
  };

  const hasFilters = searchText || materialFilter || locationFilter;

  if (spoolsLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <Title level={3} className="dashboard-title">
          FilaFlow 🧵
        </Title>
        <Text type="secondary">
          {totalWeight > 0 ? `${(totalWeight / 1000).toFixed(1)}kg disponible` : "Sin stock"}
          {totalValue > 0 && ` • ~${totalValue.toFixed(0)}€`}
        </Text>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar bobinas..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="search-input"
        allowClear
      />

      {/* Filter chips */}
      {(materials.length > 1 || locations.length > 0) && (
        <div className="filters-section">
          <div className="filter-row">
            {materials.length > 1 && (
              <Space size={[4, 8]} wrap>
                <Text type="secondary" className="filter-label">Material:</Text>
                {materials.map(mat => (
                  <FilterChip
                    key={mat}
                    label={mat}
                    active={materialFilter === mat}
                    onClick={() => setMaterialFilter(materialFilter === mat ? null : mat)}
                  />
                ))}
              </Space>
            )}
          </div>
          {locations.length > 0 && (
            <div className="filter-row">
              <Space size={[4, 8]} wrap>
                <Text type="secondary" className="filter-label">Ubicación:</Text>
                {locations.map(loc => (
                  <FilterChip
                    key={loc}
                    label={loc}
                    active={locationFilter === loc}
                    onClick={() => setLocationFilter(locationFilter === loc ? null : loc)}
                  />
                ))}
              </Space>
            </div>
          )}
          {hasFilters && (
            <Tag className="clear-filters" onClick={clearFilters}>
              ✕ Limpiar filtros
            </Tag>
          )}
        </div>
      )}

      {/* Stats */}
      <Row gutter={[12, 12]} className="stats-row">
        <Col span={8}>
          <StatCard 
            title="Bobinas" 
            value={spools.length} 
            icon={<DatabaseOutlined />}
            color="#1890ff"
            onClick={() => navigate("/spool")}
          />
        </Col>
        <Col span={8}>
          <StatCard 
            title="Filamentos" 
            value={filaments.length} 
            icon={<ExperimentOutlined />}
            color="#52c41a"
            onClick={() => navigate("/filament")}
          />
        </Col>
        <Col span={8}>
          <StatCard 
            title="Valor" 
            value={`${totalValue.toFixed(0)}€`}
            icon={<EuroOutlined />}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* Unverified spools - instructive cards */}
      {unverifiedSpools.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
            📦 Pendientes de verificar ({unverifiedSpools.length})
          </Text>
          {unverifiedSpools.map((spool: Spool) => (
            <UnverifiedSpoolCard
              key={spool.id}
              spool={spool}
              onConfirm={() => handleConfirmSpool(spool.id)}
            />
          ))}
        </div>
      )}

      {/* Low stock alert */}
      {lowStockSpools.length > 0 && (
        <Card className="alert-card">
          <Text type="warning">
            ⚠️ {lowStockSpools.length} bobina(s) con stock bajo (&lt;20%)
          </Text>
        </Card>
      )}

      {/* Spools by material */}
      {filteredSpools.length > 0 ? (
        <div className="spools-section">
          {Object.entries(spoolsByMaterial).map(([material, materialSpools]: [string, Spool[]]) => (
            <div key={material} className="material-group">
              <div className="material-header">
                <Tag color="blue">{material}</Tag>
                <Text type="secondary">{materialSpools.length} bobinas</Text>
              </div>
              {materialSpools.map((spool: Spool) => (
                <SpoolCard 
                  key={spool.id} 
                  spool={spool} 
                  onClick={() => navigate(`/spool/edit/${spool.id}`)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : spools.length > 0 ? (
        <Empty 
          description="No hay resultados"
          className="empty-state"
        >
          <Tag className="clear-filters" onClick={clearFilters}>
            Limpiar filtros
          </Tag>
        </Empty>
      ) : (
        <Empty 
          description="No hay bobinas todavía"
          className="empty-state"
        >
          <Card 
            className="add-card"
            onClick={() => navigate("/spool/create")}
          >
            <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <Text>Añadir primera bobina</Text>
          </Card>
        </Empty>
      )}

      {/* Quick add button - only show when there are spools */}
      {spools.length > 0 && (
        <div 
          className="fab-button"
          onClick={() => navigate("/spool/create")}
        >
          <PlusOutlined style={{ fontSize: 24, color: "white" }} />
        </div>
      )}
    </div>
  );
};

export default ModernDashboard;
