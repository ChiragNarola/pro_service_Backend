console.log("Running seed.ts...");

import { PrismaClient, RoleName, PaymentGateway } from '@prisma/client';
import { hashPassword } from '../src/utils/commonHelper';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding roles...");
    await prisma.role.createMany({
        data: [
            { name: RoleName.SuperAdmin, createdBy: 'system' },
            { name: RoleName.Company, createdBy: 'system' },
            { name: RoleName.Manager, createdBy: 'system' },
            { name: RoleName.Client, createdBy: 'system' },
            { name: RoleName.Employee, createdBy: 'system' }
        ],
        skipDuplicates: true,
    });

    const superAdminRole = await prisma.role.findUnique({
        where: { name: RoleName.SuperAdmin },
    });

    const hashedPassword = await hashPassword('12345678');

    console.log("Seeding super admin users...");
    await prisma.user.createMany({
        data: [
            {
                name: 'Chirag',
                lastName: 'Narola',
                email: 'cpl@narola.email',
                password: hashedPassword,
                mobileNumber: '9876543210',
                createdBy: 'system',
                status: 'Active',
                roleId: superAdminRole?.id
            }
        ],
        skipDuplicates: true,
    });

    console.log("Seeding Modules...");
    await prisma.module.createMany({
        data: [
            {
                name: 'Basic job management',
                createdBy: 'system'
            },
            {
                name: 'Client portal',
                createdBy: 'system'
            },
            {
                name: 'Email support',
                createdBy: 'system'
            },
            {
                name: 'Advanced scheduling',
                createdBy: 'system'
            },
            {
                name: 'Inventory management',
                createdBy: 'system'
            },
            {
                name: 'Analytics & reports',
                createdBy: 'system'
            },
            {
                name: 'Priority support',
                createdBy: 'system'
            },
            {
                name: 'Custom integrations',
                createdBy: 'system'
            },
            {
                name: 'Advanced analytics',
                createdBy: 'system'
            },
            {
                name: 'Dedicated support',
                createdBy: 'system'
            },
            {
                name: 'White-label options',
                createdBy: 'system'
            },
            {
                name: 'Employee',
                createdBy: 'system'
            },
        ],
        skipDuplicates: true,
    });

    console.log("Seeding permissions...");
    const permissions = [
        { name: 'company.read', description: 'Read company details', module: 'Company' },
        { name: 'company.update', description: 'Update company details', module: 'Company' },
        { name: 'company.delete', description: 'Delete company details', module: 'Company' },
        { name: 'employee.read', description: 'Read employee details', module: 'User' },
        { name: 'employee.create', description: 'Create employee details', module: 'User' },
        { name: 'employee.update', description: 'Update employee details', module: 'User' },
        { name: 'employee.delete', description: 'Delete employee details', module: 'User' },
        { name: 'inventory.read', description: 'Read inventory', module: 'Inventory' },
        { name: 'inventory.create', description: 'Create inventory', module: 'Inventory' },
        { name: 'inventory.update', description: 'Update inventory', module: 'Inventory' },
        { name: 'inventory.delete', description: 'Delete inventory', module: 'Inventory' },
        { name: 'billing.read', description: 'Read billing details', module: 'Billing' },
        { name: 'billing.create', description: 'Create billing details', module: 'Billing' },
        { name: 'billing.update', description: 'Update billing details', module: 'Billing' },
        { name: 'billing.delete', description: 'Delete billing details', module: 'Billing' },
        { name: 'job.read', description: 'Read job details', module: 'Job' },
        { name: 'job.create', description: 'Create job details', module: 'Job' },
        { name: 'job.update', description: 'Update job details', module: 'Job' },
        { name: 'job.delete', description: 'Delete job details', module: 'Job' },
        { name: 'client.read', description: 'Read client details', module: 'Client' },
        { name: 'client.create', description: 'Create client details', module: 'Client' },
        { name: 'client.update', description: 'Update client details', module: 'Client' },
        { name: 'client.delete', description: 'Delete client details', module: 'Client' },
        { name: 'financial.read', description: 'Read financial details', module: 'Financial' },
        { name: 'financial.create', description: 'Create financial details', module: 'Financial' },
        { name: 'financial.update', description: 'Update financial details', module: 'Financial' },
        { name: 'financial.delete', description: 'Delete financial details', module: 'Financial' },
    ];
    await (prisma as any).permission.createMany({
        data: permissions.map(p => ({ ...p, createdBy: 'system' })),
        skipDuplicates: true,
    });

    const allPermissions = await (prisma as any).permission.findMany({ select: { id: true, name: true } });
    const permByName = Object.fromEntries(allPermissions.map(p => [p.name, p.id]));

    console.log("Mapping role permissions...");
    const roles = await prisma.role.findMany({ select: { id: true, name: true } });

    // Default grants per role
    const grants: Record<string, Array<{ name: string; crud: [boolean, boolean, boolean, boolean] }>> = {
        SuperAdmin: permissions.map(p => ({ name: p.name, crud: [true, true, true, true] })),
        Company: [
            { name: 'company.read', crud: [false, true, false, false] },
            { name: 'user.create', crud: [true, false, false, false] },
            { name: 'inventory.create', crud: [true, false, false, false] },
        ],
        Manager: [
            { name: 'user.read', crud: [false, true, false, false] },
            { name: 'inventory.create', crud: [true, false, false, false] },
        ],
        Client: [
            { name: 'company.read', crud: [false, true, false, false] },
        ],
        Employee: [
            { name: 'inventory.read', crud: [false, true, false, false] },
        ],
    };

    for (const role of roles) {
        const roleGrants = grants[role.name as keyof typeof grants] || [];
        if (roleGrants.length === 0) continue;
        const data = roleGrants
            .filter(g => permByName[g.name])
            .map(g => ({
                roleId: role.id,
                permissionId: permByName[g.name],
                canCreate: g.crud[0],
                canRead: g.crud[1],
                canUpdate: g.crud[2],
                canDelete: g.crud[3],
                createdBy: 'system',
            }));
        if (data.length > 0) {
            await (prisma as any).rolePermission.createMany({ data, skipDuplicates: true });
        }
    }

    console.log("Seeding Subscriptions...");
    await prisma.subscription.createMany({
        data: [
            {
                planName: "Starter",
                duration: 'Annual',
                rate: 49,
                createdBy: 'system'
            },
            {
                planName: "Professional",
                duration: 'Annual',
                rate: 99,
                isPopular: true,
                createdBy: 'system'
            },
            {
                planName: "Enterprise",
                duration: 'Annual',
                rate: 199,
                createdBy: 'system'
            }
        ],
        skipDuplicates: true,
    });

    const StarterPlan = await prisma.subscription.findFirst({
        where: { planName: "Starter" },
    });
    const ProfessionalPlan = await prisma.subscription.findFirst({
        where: { planName: "Professional" },
    });
    const EnterprisePlan = await prisma.subscription.findFirst({
        where: { planName: "Enterprise" },
    });
    const basicJobManagement = await prisma.module.findFirst({
        where: { name: "Basic job management" },
    });
    const clientPortal = await prisma.module.findFirst({
        where: { name: "Client portal" },
    });
    const emailSupport = await prisma.module.findFirst({
        where: { name: "Email support" },
    });
    const advancedScheduling = await prisma.module.findFirst({
        where: { name: "Advanced scheduling" },
    });
    const inventoryManagement = await prisma.module.findFirst({
        where: { name: "Inventory management" },
    });
    const analyticsReports = await prisma.module.findFirst({
        where: { name: "Analytics & reports" },
    });
    const prioritySupport = await prisma.module.findFirst({
        where: { name: "Priority support" },
    });
    const customIntegrations = await prisma.module.findFirst({
        where: { name: "Custom integrations" },
    });
    const advancedAnalytics = await prisma.module.findFirst({
        where: { name: "Advanced analytics" },
    });
    const dedicatedSupport = await prisma.module.findFirst({
        where: { name: "Dedicated support" },
    });
    const whiteLabelOptions = await prisma.module.findFirst({
        where: { name: "White-label options" },
    });
    const employee = await prisma.module.findFirst({
        where: { name: "Employee" },
    });

    await prisma.modulePlanMapping.createMany({
        data: [
            {
                subscriptionId: StarterPlan?.id,
                moduleId: employee?.id,
                maxEmployees: "5",
                createdBy: 'system'
            },
            {
                subscriptionId: StarterPlan?.id,
                moduleId: basicJobManagement?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: StarterPlan?.id,
                moduleId: clientPortal?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: StarterPlan?.id,
                moduleId: emailSupport?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: employee?.id,
                maxEmployees: "25",
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: advancedScheduling?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: inventoryManagement?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: analyticsReports?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: ProfessionalPlan?.id,
                moduleId: prioritySupport?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: employee?.id,
                maxEmployees: "Unlimited",
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: customIntegrations?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: advancedAnalytics?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: dedicatedSupport?.id,
                createdBy: 'system'
            },
            {
                subscriptionId: EnterprisePlan?.id,
                moduleId: whiteLabelOptions?.id,
                createdBy: 'system'
            },
        ],
        skipDuplicates: true,
    });

    await prisma.department.createMany({
        data: [
            { name: 'Engineering' },
            { name: 'Human Resources' },
            { name: 'Marketing' },
            { name: 'Sales' },
            { name: 'Finance' },
            { name: 'Customer Support' },
            { name: 'IT' },
            { name: 'Legal' },
            { name: 'Operations' },
            { name: 'Product Management' },
            { name: 'Design' },
            { name: 'Research and Development' },
            { name: 'Procurement' },
            { name: 'Quality Assurance' },
        ],
        skipDuplicates: true,
    });

    await prisma.employeeRole.createMany({
        data: [
            { name: 'Software Engineer' },
            { name: 'HR Manager' },
            { name: 'Marketing Specialist' },
            { name: 'Sales Representative' },
            { name: 'Financial Analyst' },
            { name: 'Customer Support Agent' },
            { name: 'IT Administrator' },
            { name: 'Legal Counsel' },
            { name: 'Operations Manager' },
            { name: 'Product Manager' },
            { name: 'UI/UX Designer' },
            { name: 'R&D Scientist' },
            { name: 'Procurement Officer' },
            { name: 'QA Engineer' },
        ],
        skipDuplicates: true,
    });

    await prisma.services.createMany({
        data: [
            { serviceName: 'Web Development', createdBy: 'system' },
            { serviceName: 'Mobile App Development', createdBy: 'system' },
            { serviceName: 'UI/UX Design', createdBy: 'system' },
            { serviceName: 'Database Design', createdBy: 'system' },
            { serviceName: 'API Development', createdBy: 'system' },
            { serviceName: 'Cloud Infrastructure Setup', createdBy: 'system' },
            { serviceName: 'DevOps Services', createdBy: 'system' },
            { serviceName: 'Quality Assurance Testing', createdBy: 'system' },
            { serviceName: 'Security Audit', createdBy: 'system' },
            { serviceName: 'Performance Optimization', createdBy: 'system' },
            { serviceName: 'Technical Consulting', createdBy: 'system' },
            { serviceName: 'System Integration', createdBy: 'system' },
            { serviceName: 'Data Migration', createdBy: 'system' },
            { serviceName: 'Training & Support', createdBy: 'system' },
            { serviceName: 'Maintenance & Updates', createdBy: 'system' },
            { serviceName: 'SEO Optimization', createdBy: 'system' },
            { serviceName: 'Content Management', createdBy: 'system' },
            { serviceName: 'E-commerce Solutions', createdBy: 'system' },
            { serviceName: 'Analytics Implementation', createdBy: 'system' },
            { serviceName: 'Backup & Recovery', createdBy: 'system' },
        ],
        skipDuplicates: true,
    });

    const superAdminUser = await prisma.user.findFirst({
        where: { roleId: superAdminRole?.id },
    });

    await prisma.systemSettings.createMany({
        data: [
            { userId: superAdminUser?.id, emailNotifications: false, smsNotifications: false, paymentGateway: PaymentGateway.Stripe, createdBy: 'system', billingCurrency: 'USD', billingInvoicePrefix: 'INV-', billingTaxRate: 0, primaryColor: '#0ea5e9', secondaryColor: '#64748b', brandingLogo: null, supportEmail: 'support@mailsac.com', supportAutoAssign: true, supportSlaHours: 24, supportAutoReply: true, stripePubKey: '', stripeSecretKey: '' },
        ],
        skipDuplicates: true,
    });

    const US_STATES = [
        { name: 'Alabama', code: 'AL' },
        { name: 'Alaska', code: 'AK' },
        { name: 'Arizona', code: 'AZ' },
        { name: 'Arkansas', code: 'AR' },
        { name: 'California', code: 'CA' },
        { name: 'Colorado', code: 'CO' },
        { name: 'Connecticut', code: 'CT' },
        { name: 'Delaware', code: 'DE' },
        { name: 'Florida', code: 'FL' },
        { name: 'Georgia', code: 'GA' },
        { name: 'Hawaii', code: 'HI' },
        { name: 'Idaho', code: 'ID' },
        { name: 'Illinois', code: 'IL' },
        { name: 'Indiana', code: 'IN' },
        { name: 'Iowa', code: 'IA' },
        { name: 'Kansas', code: 'KS' },
        { name: 'Kentucky', code: 'KY' },
        { name: 'Louisiana', code: 'LA' },
        { name: 'Maine', code: 'ME' },
        { name: 'Maryland', code: 'MD' },
        { name: 'Massachusetts', code: 'MA' },
        { name: 'Michigan', code: 'MI' },
        { name: 'Minnesota', code: 'MN' },
        { name: 'Mississippi', code: 'MS' },
        { name: 'Missouri', code: 'MO' },
        { name: 'Montana', code: 'MT' },
        { name: 'Nebraska', code: 'NE' },
        { name: 'Nevada', code: 'NV' },
        { name: 'New Hampshire', code: 'NH' },
        { name: 'New Jersey', code: 'NJ' },
        { name: 'New Mexico', code: 'NM' },
        { name: 'New York', code: 'NY' },
        { name: 'North Carolina', code: 'NC' },
        { name: 'North Dakota', code: 'ND' },
        { name: 'Ohio', code: 'OH' },
        { name: 'Oklahoma', code: 'OK' },
        { name: 'Oregon', code: 'OR' },
        { name: 'Pennsylvania', code: 'PA' },
        { name: 'Rhode Island', code: 'RI' },
        { name: 'South Carolina', code: 'SC' },
        { name: 'South Dakota', code: 'SD' },
        { name: 'Tennessee', code: 'TN' },
        { name: 'Texas', code: 'TX' },
        { name: 'Utah', code: 'UT' },
        { name: 'Vermont', code: 'VT' },
        { name: 'Virginia', code: 'VA' },
        { name: 'Washington', code: 'WA' },
        { name: 'West Virginia', code: 'WV' },
        { name: 'Wisconsin', code: 'WI' },
        { name: 'Wyoming', code: 'WY' },
        { name: 'District of Columbia', code: 'DC' }
    ];

    console.log("Seeding US states...");
    await prisma.state.createMany({
        data: US_STATES.map(state => ({
            name: state.name,
            code: state.code,
            isActive: true,
            createdBy: 'system'
        })),
        skipDuplicates: true,
    });

    const US_STATES_DATA = await prisma.state.findMany({
        select: {
            id: true,
            name: true,
            code: true,
        }
    });

    // Major US cities data
    const US_CITIES = [
        // Alabama
        { stateCode: 'AL', cities: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'] },
        // Alaska
        { stateCode: 'AK', cities: ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'] },
        // Arizona
        { stateCode: 'AZ', cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise'] },
        // Arkansas
        { stateCode: 'AR', cities: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'] },
        // California
        { stateCode: 'CA', cities: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto', 'Fontana', 'Oxnard'] },
        // Colorado
        { stateCode: 'CO', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Westminster', 'Pueblo', 'Arvada', 'Centennial'] },
        // Connecticut
        { stateCode: 'CT', cities: ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich'] },
        // Delaware
        { stateCode: 'DE', cities: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'] },
        // Florida
        { stateCode: 'FL', cities: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie', 'Cape Coral', 'Pembroke Pines', 'Hollywood', 'Miramar', 'Gainesville', 'Coral Springs'] },
        // Georgia
        { stateCode: 'GA', cities: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Macon', 'Johns Creek', 'Albany'] },
        // Hawaii
        { stateCode: 'HI', cities: ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Kaneohe'] },
        // Idaho
        { stateCode: 'ID', cities: ['Boise', 'Nampa', 'Meridian', 'Idaho Falls', 'Pocatello'] },
        // Illinois
        { stateCode: 'IL', cities: ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Cicero', 'Champaign', 'Bloomington', 'Arlington Heights', 'Evanston', 'Decatur'] },
        // Indiana
        { stateCode: 'IN', cities: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary', 'Muncie'] },
        // Iowa
        { stateCode: 'IA', cities: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Council Bluffs', 'Ames', 'West Des Moines', 'Dubuque'] },
        // Kansas
        { stateCode: 'KS', cities: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina'] },
        // Kentucky
        { stateCode: 'KY', cities: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Hopkinsville', 'Richmond', 'Florence', 'Georgetown', 'Henderson'] },
        // Louisiana
        { stateCode: 'LA', cities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma'] },
        // Maine
        { stateCode: 'ME', cities: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford', 'Saco', 'Augusta', 'Westbrook'] },
        // Maryland
        { stateCode: 'MD', cities: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Annapolis', 'College Park', 'Salisbury', 'Laurel', 'Greenbelt'] },
        // Massachusetts
        { stateCode: 'MA', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'New Bedford', 'Quincy', 'Lynn', 'Newton'] },
        // Michigan
        { stateCode: 'MI', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor', 'Flint', 'Dearborn', 'Livonia', 'Westland'] },
        // Minnesota
        { stateCode: 'MN', cities: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'Saint Cloud', 'Eagan', 'Woodbury'] },
        // Mississippi
        { stateCode: 'MS', cities: ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Greenville', 'Olive Branch', 'Horn Lake'] },
        // Missouri
        { stateCode: 'MO', cities: ['Kansas City', 'Saint Louis', 'Springfield', 'Independence', 'Columbia', 'Lee\'s Summit', 'O\'Fallon', 'Saint Joseph', 'Saint Charles', 'Saint Peters'] },
        // Montana
        { stateCode: 'MT', cities: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell', 'Havre', 'Anaconda', 'Miles City'] },
        // Nebraska
        { stateCode: 'NE', cities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'North Platte', 'Norfolk', 'Columbus'] },
        // Nevada
        { stateCode: 'NV', cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley', 'Elko', 'Mesquite', 'Boulder City'] },
        // New Hampshire
        { stateCode: 'NH', cities: ['Manchester', 'Nashua', 'Concord', 'Derry', 'Rochester', 'Dover', 'Salem', 'Keene', 'Londonderry', 'Hudson'] },
        // New Jersey
        { stateCode: 'NJ', cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Hamilton', 'Trenton'] },
        // New Mexico
        { stateCode: 'NM', cities: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis', 'Hobbs', 'Alamogordo', 'Carlsbad'] },
        // New York
        { stateCode: 'NY', cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica'] },
        // North Carolina
        { stateCode: 'NC', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Concord'] },
        // North Dakota
        { stateCode: 'ND', cities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Mandan', 'Jamestown', 'Wahpeton'] },
        // Ohio
        { stateCode: 'OH', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain'] },
        // Oklahoma
        { stateCode: 'OK', cities: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City', 'Enid', 'Stillwater'] },
        // Oregon
        { stateCode: 'OR', cities: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Bend', 'Beaverton', 'Medford', 'Springfield', 'Corvallis'] },
        // Pennsylvania
        { stateCode: 'PA', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona'] },
        // Rhode Island
        { stateCode: 'RI', cities: ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport', 'Central Falls', 'Westerly', 'Cumberland'] },
        // South Carolina
        { stateCode: 'SC', cities: ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Hilton Head Island', 'Spartanburg'] },
        // South Dakota
        { stateCode: 'SD', cities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton', 'Pierre', 'Huron', 'Vermillion'] },
        // Tennessee
        { stateCode: 'TN', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Bartlett'] },
        // Texas
        { stateCode: 'TX', cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'Pasadena', 'Mesquite', 'McKinney'] },
        // Utah
        { stateCode: 'UT', cities: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'Taylorsville'] },
        // Vermont
        { stateCode: 'VT', cities: ['Burlington', 'Essex', 'South Burlington', 'Colchester', 'Rutland', 'Montpelier', 'Barre', 'St. Albans', 'Winooski', 'Brattleboro'] },
        // Virginia
        { stateCode: 'VA', cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Portsmouth', 'Suffolk', 'Roanoke'] },
        // Washington
        { stateCode: 'WA', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Yakima', 'Federal Way'] },
        // West Virginia
        { stateCode: 'WV', cities: ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown', 'Wheeling', 'Martinsburg', 'Fairmont', 'Beckley', 'Clarksburg', 'South Charleston'] },
        // Wisconsin
        { stateCode: 'WI', cities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Oshkosh', 'Eau Claire', 'Janesville'] },
        // Wyoming
        { stateCode: 'WY', cities: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River', 'Evanston', 'Riverton', 'Jackson'] },
        // District of Columbia
        { stateCode: 'DC', cities: ['Washington'] }
    ];

    console.log("Seeding US cities...");
    
    // Create cities for each state
    for (const stateData of US_CITIES) {
        const state = US_STATES_DATA.find(s => s.code === stateData.stateCode);
        if (state) {
            const citiesData = stateData.cities.map(cityName => ({
                stateId: state.id,
                name: cityName,
                isActive: true,
                createdBy: 'system'
            }));
            console.log("🚀 ~ main ~ citiesData:", citiesData)

            // await prisma.city.createMany({
            //     data: citiesData,
            //     skipDuplicates: true,
            // });

            console.log(`✅ Created ${citiesData.length} cities for ${state.name}`);
        }
    }

}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
