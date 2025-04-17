const donorController = require('../../src/controllers/donor.controller');
const Donor = require('../../src/models/donor.model');

// Mock des modules
jest.mock('../../src/models/donor.model');

describe('Donor Controller', () => {
  let mockRequest;
  let mockResponse;
  
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('getDonors doit retourner tous les donateurs', async () => {
    const mockDonors = [
      { id: 1, firstname: 'Jean', lastname: 'Dupont' },
      { id: 2, firstname: 'Marie', lastname: 'Martin' }
    ];
    
    Donor.getAll.mockResolvedValue(mockDonors);
    
    await donorController.getDonors(mockRequest, mockResponse);
    
    expect(Donor.getAll).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(mockDonors);
  });

  test('getDonor doit retourner un donateur spécifique', async () => {
    const mockDonor = { id: 1, firstname: 'Jean', lastname: 'Dupont' };
    
    mockRequest.params = { id: 1 };
    Donor.getById.mockResolvedValue(mockDonor);
    
    await donorController.getDonor(mockRequest, mockResponse);
    
    expect(Donor.getById).toHaveBeenCalledWith(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockDonor);
  });

  test('createDonor doit créer un nouveau donateur', async () => {
    mockRequest.body = {
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre@example.com',
      phone: '0123456789',
      address: '2 rue des Fleurs',
      city: 'Lyon',
      zip_code: '69000'
    };
    
    await donorController.createDonor(mockRequest, mockResponse);
    
    expect(Donor.create).toHaveBeenCalledWith(expect.objectContaining({
      firstname: 'Pierre',
      lastname: 'Durand'
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  test('updateDonor doit mettre à jour un donateur', async () => {
    mockRequest.params = { id: 1 };
    mockRequest.body = {
      firstName: 'Jean',
      lastName: 'Dupont-Martin',
      email: 'jean@example.com',
      phone: '0987654321'
    };
    
    await donorController.updateDonor(mockRequest, mockResponse);
    
    expect(Donor.update).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      firstname: 'Jean',
      lastname: 'Dupont-Martin'
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });

  test('deleteDonor doit supprimer un donateur', async () => {
    mockRequest.params = { id: 1 };
    
    await donorController.deleteDonor(mockRequest, mockResponse);
    
    expect(Donor.delete).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });
});
