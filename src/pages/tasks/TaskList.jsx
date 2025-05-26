import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaPlus, FaFileDownload, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import { utils, writeFileXLSX } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import TaskCard from '../../components/tasks/TaskCard';
import { useTask } from '../../context/TaskContext';
import Loader from '../../components/common/Loader';

const TaskList = () => {
  const { tasks, loading, fetchTasks } = useTask();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending', 'overdue'
  const [filterCategory, setFilterCategory] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const [categories, setCategories] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Extract unique categories
  useEffect(() => {
    if (tasks.length > 0) {
      const uniqueCategories = [...new Set(tasks.map(task => task.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [tasks]);

  // Filter and sort tasks
  useEffect(() => {
    let result = [...tasks];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(term) || 
          (task.description && task.description.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      if (filterStatus === 'completed') {
        result = result.filter(task => task.completed);
      } else if (filterStatus === 'pending') {
        result = result.filter(task => !task.completed && new Date(task.dueDate) >= now);
      } else if (filterStatus === 'overdue') {
        result = result.filter(task => !task.completed && new Date(task.dueDate) < now);
      }
    }
    
    // Apply category filter
    if (filterCategory) {
      result = result.filter(task => task.category === filterCategory);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch(sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'status':
          comparison = (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTasks(result);
  }, [tasks, searchTerm, filterStatus, filterCategory, sortField, sortDirection]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterStatus = (status) => {
    setFilterStatus(status);
  };

  const handleFilterCategory = (category) => {
    setFilterCategory(category);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export functions
  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(
      filteredTasks.map(task => ({
        Title: task.title,
        Description: task.description || '',
        Category: task.category || '',
        'Due Date': new Date(task.dueDate).toLocaleDateString(),
        Status: task.completed ? 'Completed' : 'Pending'
      }))
    );
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Tasks');
    writeFileXLSX(workbook, 'tasks.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Task List', 14, 22);
    
    // Define the table structure
    const tableColumn = ["Title", "Category", "Due Date", "Status"];
    const tableRows = filteredTasks.map(task => [
      task.title,
      task.category || '',
      new Date(task.dueDate).toLocaleDateString(),
      task.completed ? 'Completed' : 'Pending'
    ]);
    
    // Generate PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [2, 117, 216] },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.save('tasks.pdf');
  };

  if (loading && tasks.length === 0) {
    return <Loader />;
  }

  return (
    <Container className="py-4 fade-in">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Task List</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/tasks/new')}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" /> New Task
          </Button>
        </Col>
      </Row>
      
      {/* Filters and Search */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Col>
            
            <Col md={8}>
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <DropdownButton 
                  id="status-filter" 
                  title={<><FaFilter className="me-1" /> Status</>} 
                  variant="outline-secondary"
                >
                  <Dropdown.Item 
                    active={filterStatus === 'all'} 
                    onClick={() => handleFilterStatus('all')}
                  >
                    All
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={filterStatus === 'pending'} 
                    onClick={() => handleFilterStatus('pending')}
                  >
                    Pending
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={filterStatus === 'completed'} 
                    onClick={() => handleFilterStatus('completed')}
                  >
                    Completed
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={filterStatus === 'overdue'} 
                    onClick={() => handleFilterStatus('overdue')}
                  >
                    Overdue
                  </Dropdown.Item>
                </DropdownButton>
                
                <DropdownButton 
                  id="category-filter" 
                  title={<><FaFilter className="me-1" /> Category</>} 
                  variant="outline-secondary"
                >
                  <Dropdown.Item 
                    active={filterCategory === ''} 
                    onClick={() => handleFilterCategory('')}
                  >
                    All Categories
                  </Dropdown.Item>
                  {categories.map(category => (
                    <Dropdown.Item 
                      key={category} 
                      active={filterCategory === category} 
                      onClick={() => handleFilterCategory(category)}
                    >
                      {category}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
                
                <DropdownButton 
                  id="sort-options" 
                  title={
                    <div className="d-flex align-items-center">
                      {sortDirection === 'asc' ? <FaSortAmountUp className="me-1" /> : <FaSortAmountDown className="me-1" />} 
                      Sort
                    </div>
                  } 
                  variant="outline-secondary"
                >
                  <Dropdown.Item 
                    active={sortField === 'dueDate'} 
                    onClick={() => handleSort('dueDate')}
                  >
                    Due Date
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={sortField === 'title'} 
                    onClick={() => handleSort('title')}
                  >
                    Title
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={sortField === 'category'} 
                    onClick={() => handleSort('category')}
                  >
                    Category
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={sortField === 'status'} 
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </Dropdown.Item>
                </DropdownButton>
                
                <DropdownButton 
                  id="export-options" 
                  title={<><FaFileDownload className="me-1" /> Export</>} 
                  variant="outline-success"
                >
                  <CSVLink 
                    data={filteredTasks.map(task => ({
                      Title: task.title,
                      Description: task.description || '',
                      Category: task.category || '',
                      'Due Date': new Date(task.dueDate).toLocaleDateString(),
                      Status: task.completed ? 'Completed' : 'Pending'
                    }))}
                    filename="tasks.csv"
                    className="dropdown-item"
                  >
                    CSV
                  </CSVLink>
                  <Dropdown.Item onClick={exportToExcel}>Excel</Dropdown.Item>
                  <Dropdown.Item onClick={exportToPDF}>PDF</Dropdown.Item>
                </DropdownButton>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Task List */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {filteredTasks.length > 0 ? (
            <div className="task-list">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center p-5">
              <p className="mb-3 text-muted">No tasks found</p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/tasks/new')}
                className="d-inline-flex align-items-center"
              >
                <FaPlus className="me-2" /> Create your first task
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TaskList;