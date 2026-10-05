import React, { useState, useMemo } from 'react';
import {
  DatabaseConfig,
  DatabaseItem,
  DatabaseProperty,
  DatabaseViewType,
} from '@/types/notion';
import {
  Table as TableIcon,
  Kanban,
  Calendar as CalendarIcon,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { ItemDetailModal } from './ItemDetailModal';
import { IconRenderer } from '../common/IconRenderer';

interface DatabaseViewProps {
  database: DatabaseConfig;
  onChange: (updatedDatabase: DatabaseConfig) => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ database, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<DatabaseItem | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const currentView = useMemo(() => {
    return database.views.find((v) => v.id === database.activeViewId) || database.views[0];
  }, [database.views, database.activeViewId]);

  const statusProperty = useMemo(() => {
    return database.properties.find((p) => p.type === 'status');
  }, [database.properties]);

  const statusOptions = statusProperty?.options || [
    { id: 'Backlog', label: 'Backlog', color: 'bg-neutral-100 text-neutral-700' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { id: 'In Review', label: 'In Review', color: 'bg-amber-100 text-amber-700' },
    { id: 'Done', label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
  ];

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let items = [...database.items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          Object.values(it.properties).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      items = items.filter((it) => it.properties.status === statusFilter);
    }

    return items;
  }, [database.items, searchQuery, statusFilter]);

  const handleUpdateItem = (updated: DatabaseItem) => {
    const newItems = database.items.map((it) => (it.id === updated.id ? updated : it));
    onChange({ ...database, items: newItems });
    setSelectedItem(updated);
  };

  const handleAddItem = (initialStatus?: string) => {
    const newItem: DatabaseItem = {
      id: `item-${Date.now()}`,
      title: 'New Page',
      icon: '📄',
      cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      properties: {
        status: initialStatus || statusOptions[0]?.label || 'Backlog',
        priority: 'P2 - Medium',
        assignee: 'Me',
        dueDate: new Date().toISOString().split('T')[0],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onChange({ ...database, items: [newItem, ...database.items] });
    setSelectedItem(newItem);
  };

  const handleDeleteItem = (id: string) => {
    onChange({ ...database, items: database.items.filter((it) => it.id !== id) });
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleSwitchView = (viewId: string) => {
    onChange({ ...database, activeViewId: viewId });
  };

  const handleAddView = (type: DatabaseViewType) => {
    const nameMap: Record<DatabaseViewType, string> = {
      table: 'Table View',
      board: 'Board View',
      calendar: 'Calendar View',
      gallery: 'Gallery View',
      list: 'List View',
    };
    const newView = {
      id: `view-${Date.now()}`,
      name: `${nameMap[type]} ${database.views.length + 1}`,
      type,
    };
    onChange({
      ...database,
      views: [...database.views, newView],
      activeViewId: newView.id,
    });
  };

  const getViewIcon = (type: DatabaseViewType) => {
    switch (type) {
      case 'board':
        return <Kanban className="w-3.5 h-3.5" />;
      case 'calendar':
        return <CalendarIcon className="w-3.5 h-3.5" />;
      case 'gallery':
        return <LayoutGrid className="w-3.5 h-3.5" />;
      case 'list':
        return <ListIcon className="w-3.5 h-3.5" />;
      case 'table':
      default:
        return <TableIcon className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* View Switcher Tabs & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {database.views.map((v) => {
            const isActive = v.id === database.activeViewId;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSwitchView(v.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/50'
                }`}
              >
                {getViewIcon(v.type)}
                <span>{v.name}</span>
              </button>
            );
          })}

          {/* Quick Add View dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <Plus className="w-3 h-3" />
              <span>Add view</span>
            </button>
            <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-40 w-36 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => handleAddView('table')}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddView('board')}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddView('calendar')}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddView('gallery')}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddView('list')}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search, Filter & New Action */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-32 md:w-44 rounded-md border border-neutral-200 bg-white pl-8 pr-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 rounded-md border border-neutral-200 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt.id} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* + New Button */}
          <button
            type="button"
            onClick={() => handleAddItem()}
            className="flex h-7 items-center gap-1 rounded-md bg-blue-600 px-2.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Render Current View */}
      {currentView.type === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
          {statusOptions.map((status) => {
            const itemsInStatus = filteredItems.filter(
              (item) => item.properties.status === status.label
            );
            return (
              <div
                key={status.id}
                className="flex flex-col rounded-lg bg-neutral-50/70 p-3 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 min-h-[300px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {status.label}
                    </span>
                    <span className="text-xs text-neutral-400 tabular-nums">
                      {itemsInStatus.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddItem(status.label)}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-700"
                    title={`Add item to ${status.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards List */}
                <div className="space-y-2 flex-1">
                  {itemsInStatus.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="group cursor-pointer rounded-lg border border-neutral-200 bg-white p-3 shadow-xs hover:border-neutral-300 hover:shadow-md transition-all dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      {item.cover && (
                        <div
                          className="h-16 w-full rounded mb-2"
                          style={{ background: item.cover }}
                        />
                      )}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <IconRenderer icon={item.icon} className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
                        <h4 className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                      </div>

                      {/* Card Metadata info */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                        {item.properties.priority && (
                          <span className="font-medium text-rose-600 dark:text-rose-400">
                            {item.properties.priority}
                          </span>
                        )}
                        {item.properties.priority && item.properties.assignee && <span>·</span>}
                        {item.properties.assignee && (
                          <span>{item.properties.assignee}</span>
                        )}
                        {item.properties.dueDate && (
                          <>
                            <span>·</span>
                            <span className="tabular-nums">{item.properties.dueDate}</span>
                          </>
                        )}
                      </div>

                      {/* Quick Move Status Arrows */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-700/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          value={item.properties.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateItem({
                              ...item,
                              properties: { ...item.properties, status: e.target.value },
                            });
                          }}
                          className="text-[10px] rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 dark:border-neutral-600 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                        >
                          {statusOptions.map((s) => (
                            <option key={s.id} value={s.label}>
                              Move: {s.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="text-neutral-400 hover:text-rose-500 p-1"
                          title="Delete card"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* + New card bottom */}
                <button
                  type="button"
                  onClick={() => handleAddItem(status.label)}
                  className="mt-2 flex items-center gap-1.5 rounded-md py-1.5 text-xs text-neutral-400 hover:bg-neutral-200/50 hover:text-neutral-700 dark:hover:bg-neutral-700/50 transition-colors w-full pl-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {currentView.type === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                <th className="py-2.5 px-3 text-left font-medium w-64">Name</th>
                {database.properties.map((prop) => (
                  <th key={prop.id} className="py-2.5 px-3 text-left font-medium min-w-[120px]">
                    {prop.name}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right font-medium w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group border-b border-neutral-100 hover:bg-neutral-50/80 dark:border-neutral-800/80 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                    <IconRenderer icon={item.icon} className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
                    <span className="truncate">{item.title}</span>
                  </td>
                  {database.properties.map((prop) => {
                    const val = item.properties[prop.id];
                    return (
                      <td key={prop.id} className="py-2.5 px-3 text-neutral-600 dark:text-neutral-300">
                        {prop.type === 'status' ? (
                          <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                            {val || 'None'}
                          </span>
                        ) : prop.type === 'priority' ? (
                          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            {val || '-'}
                          </span>
                        ) : (
                          <span className="tabular-nums">{val !== undefined ? String(val) : '-'}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={database.properties.length + 2} className="py-2 px-3">
                  <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New row</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {currentView.type === 'gallery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="cursor-pointer rounded-lg border border-neutral-200 bg-white shadow-xs hover:border-neutral-300 hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-800 overflow-hidden"
            >
              <div
                className="h-28 w-full"
                style={{
                  background:
                    item.cover || 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                }}
              />
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <IconRenderer icon={item.icon} className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {item.title}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>{item.properties.status || 'No status'}</span>
                  <span>·</span>
                  <span>{item.properties.assignee || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddItem()}
            className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 p-4 text-xs text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 dark:border-neutral-800 dark:hover:border-neutral-700 transition-colors"
          >
            <Plus className="w-6 h-6 mb-1 text-neutral-300" />
            <span>Add a page</span>
          </button>
        </div>
      )}

      {currentView.type === 'calendar' && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
                }
                className="rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCalendarDate(new Date())}
                className="rounded px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
                }
                className="rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-px bg-neutral-200 dark:bg-neutral-800 text-center text-[11px] font-medium text-neutral-500 py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid (Sample current month 35 days) */}
          <div className="grid grid-cols-7 gap-px bg-neutral-200 dark:bg-neutral-800 mt-1">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = (i % 31) + 1;
              const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
              const dayItems = filteredItems.filter((it) => it.properties.dueDate === dateStr);

              return (
                <div
                  key={i}
                  className="min-h-[90px] bg-white p-1.5 dark:bg-neutral-900 group hover:bg-neutral-50/50 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="font-medium">{dayNum}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem: DatabaseItem = {
                          id: `item-${Date.now()}`,
                          title: 'New Event',
                          icon: '📅',
                          properties: {
                            status: 'In Progress',
                            dueDate: dateStr,
                          },
                          createdAt: Date.now(),
                          updatedAt: Date.now(),
                        };
                        onChange({ ...database, items: [...database.items, newItem] });
                        setSelectedItem(newItem);
                      }}
                      className="opacity-0 group-hover:opacity-100 rounded hover:bg-neutral-200 p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayItems.map((it) => (
                      <div
                        key={it.id}
                        onClick={() => setSelectedItem(it)}
                        className="truncate rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300 cursor-pointer hover:bg-blue-100"
                      >
                        {it.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentView.type === 'list' && (
        <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100 dark:border-neutral-800 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <IconRenderer icon={item.icon} className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                  {item.properties.status || 'No status'}
                </span>
                {item.properties.dueDate && (
                  <span className="tabular-nums text-[11px]">{item.properties.dueDate}</span>
                )}
                {item.properties.assignee && (
                  <span className="text-[11px]">{item.properties.assignee}</span>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddItem()}
            className="flex w-full items-center gap-2 p-3 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New item</span>
          </button>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          properties={database.properties}
          onUpdateItem={handleUpdateItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};
