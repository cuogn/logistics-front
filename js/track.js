// Track Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Track form handling
    const trackForm = document.getElementById('trackForm');
    const trackingInput = document.getElementById('trackingNumber');
    const trackingResults = document.getElementById('trackingResults');
    const noResults = document.getElementById('noResults');
    
    if (trackForm) {
        trackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const trackingNumber = trackingInput.value.trim();
            
            if (!trackingNumber) {
                showTrackNotification('Please enter a tracking number', 'error');
                return;
            }
            
            // Simulate tracking search
            showTrackNotification('Searching for shipment...', 'info');
            
            setTimeout(() => {
                if (isValidTrackingNumber(trackingNumber)) {
                    displayTrackingResults(trackingNumber);
                    showTrackNotification('Shipment found!', 'success');
                } else {
                    showNoResults();
                    showTrackNotification('No shipment found with that tracking number', 'error');
                }
            }, 1500);
        });
    }
    
    // Sample tracking buttons
    const sampleButtons = document.querySelectorAll('.sample-btn');
    sampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const trackingNumber = this.getAttribute('data-tracking');
            trackingInput.value = trackingNumber;
            trackForm.dispatchEvent(new Event('submit'));
        });
    });
});

// Validate tracking number format
function isValidTrackingNumber(trackingNumber) {
    // Sample tracking numbers for demo
    const validNumbers = ['LT-2024-001', 'LT-2024-002', 'LT-2024-003'];
    return validNumbers.includes(trackingNumber.toUpperCase());
}

// Display tracking results
function displayTrackingResults(trackingNumber) {
    const trackingResults = document.getElementById('trackingResults');
    const noResults = document.getElementById('noResults');
    const displayTrackingNumber = document.getElementById('displayTrackingNumber');
    
    // Hide no results
    noResults.style.display = 'none';
    
    // Update tracking number display
    displayTrackingNumber.textContent = trackingNumber;
    
    // Update shipment details based on tracking number
    updateShipmentDetails(trackingNumber);
    
    // Generate timeline
    generateTimeline(trackingNumber);
    
    // Show results
    trackingResults.style.display = 'block';
    
    // Smooth scroll to results
    trackingResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update shipment details
function updateShipmentDetails(trackingNumber) {
    const shipmentData = {
        'LT-2024-001': {
            origin: 'Shanghai, China',
            destination: 'New York, USA',
            packageType: 'Electronics',
            weight: '25.5 kg',
            estimatedDelivery: 'Dec 15, 2024',
            currentStatus: 'In Transit'
        },
        'LT-2024-002': {
            origin: 'Mumbai, India',
            destination: 'London, UK',
            packageType: 'Textiles',
            weight: '15.2 kg',
            estimatedDelivery: 'Dec 12, 2024',
            currentStatus: 'Delivered'
        },
        'LT-2024-003': {
            origin: 'Berlin, Germany',
            destination: 'Toronto, Canada',
            packageType: 'Machinery',
            weight: '45.8 kg',
            estimatedDelivery: 'Dec 20, 2024',
            currentStatus: 'Pending'
        }
    };
    
    const data = shipmentData[trackingNumber];
    if (data) {
        document.getElementById('origin').textContent = data.origin;
        document.getElementById('destination').textContent = data.destination;
        document.getElementById('packageType').textContent = data.packageType;
        document.getElementById('weight').textContent = data.weight;
        document.getElementById('estimatedDelivery').textContent = data.estimatedDelivery;
        
        const statusElement = document.getElementById('currentStatus');
        statusElement.textContent = data.currentStatus;
        
        // Update status styling
        statusElement.className = 'status';
        if (data.currentStatus === 'Delivered') {
            statusElement.style.background = '#d1fae5';
            statusElement.style.color = '#059669';
        } else if (data.currentStatus === 'Pending') {
            statusElement.style.background = '#e0e7ff';
            statusElement.style.color = '#7c3aed';
        }
    }
}

// Generate timeline
function generateTimeline(trackingNumber) {
    const timeline = document.getElementById('timeline');
    const timelineData = {
        'LT-2024-001': [
            {
                icon: 'package',
                title: 'Package Picked Up',
                description: 'Package collected from sender in Shanghai',
                time: 'Dec 10, 2024 - 09:30 AM',
                status: 'completed'
            },
            {
                icon: 'warehouse',
                title: 'At Origin Facility',
                description: 'Package processed and ready for shipment',
                time: 'Dec 10, 2024 - 02:15 PM',
                status: 'completed'
            },
            {
                icon: 'plane',
                title: 'In Transit',
                description: 'Package departed from Shanghai International Airport',
                time: 'Dec 11, 2024 - 08:45 AM',
                status: 'current'
            },
            {
                icon: 'map-pin',
                title: 'Arrival at Destination',
                description: 'Package arrived at New York International Airport',
                time: 'Dec 14, 2024 - 03:20 PM',
                status: 'pending'
            },
            {
                icon: 'truck',
                title: 'Out for Delivery',
                description: 'Package loaded for final delivery',
                time: 'Dec 15, 2024 - 08:00 AM',
                status: 'pending'
            },
            {
                icon: 'check-circle',
                title: 'Delivered',
                description: 'Package successfully delivered to recipient',
                time: 'Dec 15, 2024 - 02:30 PM',
                status: 'pending'
            }
        ],
        'LT-2024-002': [
            {
                icon: 'package',
                title: 'Package Picked Up',
                description: 'Package collected from sender in Mumbai',
                time: 'Dec 8, 2024 - 10:15 AM',
                status: 'completed'
            },
            {
                icon: 'warehouse',
                title: 'At Origin Facility',
                description: 'Package processed and ready for shipment',
                time: 'Dec 8, 2024 - 04:30 PM',
                status: 'completed'
            },
            {
                icon: 'plane',
                title: 'In Transit',
                description: 'Package departed from Mumbai International Airport',
                time: 'Dec 9, 2024 - 11:20 AM',
                status: 'completed'
            },
            {
                icon: 'map-pin',
                title: 'Arrival at Destination',
                description: 'Package arrived at London Heathrow Airport',
                time: 'Dec 11, 2024 - 09:45 AM',
                status: 'completed'
            },
            {
                icon: 'truck',
                title: 'Out for Delivery',
                description: 'Package loaded for final delivery',
                time: 'Dec 12, 2024 - 07:30 AM',
                status: 'completed'
            },
            {
                icon: 'check-circle',
                title: 'Delivered',
                description: 'Package successfully delivered to recipient',
                time: 'Dec 12, 2024 - 01:45 PM',
                status: 'completed'
            }
        ],
        'LT-2024-003': [
            {
                icon: 'package',
                title: 'Package Picked Up',
                description: 'Package collected from sender in Berlin',
                time: 'Dec 13, 2024 - 02:00 PM',
                status: 'pending'
            }
        ]
    };
    
    const data = timelineData[trackingNumber];
    if (data) {
        timeline.innerHTML = '';
        
        data.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item ${item.status}`;
            timelineItem.innerHTML = `
                <div class="timeline-icon">
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="timeline-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <span class="time">${item.time}</span>
                </div>
            `;
            timeline.appendChild(timelineItem);
        });
        
        // Reinitialize icons
        lucide.createIcons();
    }
}

// Show no results
function showNoResults() {
    const trackingResults = document.getElementById('trackingResults');
    const noResults = document.getElementById('noResults');
    
    trackingResults.style.display = 'none';
    noResults.style.display = 'block';
}

// Clear tracking
function clearTracking() {
    const trackingInput = document.getElementById('trackingNumber');
    const trackingResults = document.getElementById('trackingResults');
    const noResults = document.getElementById('noResults');
    
    trackingInput.value = '';
    trackingResults.style.display = 'none';
    noResults.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show track notification
function showTrackNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.track-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `track-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .track-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        }
        
        .track-notification.show {
            transform: translateX(0);
        }
        
        .track-notification.info {
            background: #1e40af;
            color: white;
        }
        
        .track-notification.success {
            background: #10b981;
            color: white;
        }
        
        .track-notification.error {
            background: #ef4444;
            color: white;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .notification-content i {
            width: 1.25rem;
            height: 1.25rem;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
    
    // Initialize icons
    lucide.createIcons();
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'alert-circle';
        case 'info':
        default:
            return 'info';
    }
} 