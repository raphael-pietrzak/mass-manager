const MassService = require('../../src/services/mass.service');
const db = require('../../config/database');
const Mass = require('../../src/models/mass.model');

// Mocks pour les fonctions du modèle Mass
jest.mock('../../src/models/mass.model', () => ({
  isCelebrantAvailable: jest.fn(),
  getRandomAvailableCelebrant: jest.fn(),
  findNextAvailableSlotForCelebrant: jest.fn(),
  findNextAvailableSlot: jest.fn()
}));

jest.mock('../../config/database', () => ({
  raw: jest.fn()
}));


describe('MassService', () => {
  // Mock data
  const mockCelebrant1 = { id: 1, religious_name: 'Père Jean' };
  const mockCelebrant2 = { id: 2, religious_name: 'Père Pierre' };
  const testDate = '2023-06-15';
  const nextDate = '2023-06-20';
  
  beforeEach(() => {
    // Setup for getCelebrantById
    MassService.getCelebrantById = jest.fn().mockImplementation(id => {
      if (id === 1) return Promise.resolve(mockCelebrant1);
      if (id === 2) return Promise.resolve(mockCelebrant2);
      return Promise.resolve(null);
    });
    
    // Setup for getLeastBusyCelebrant
    MassService.getLeastBusyCelebrant = jest.fn().mockResolvedValue(mockCelebrant1);
    
    // Mock db.raw pour getLeastBusyCelebrant
    db.raw.mockResolvedValue({ rows: [mockCelebrant1] });
  });
  
  describe('Scénario 1: Date impérative ET célébrant sélectionné', () => {
    test('Doit réussir si le célébrant est disponible à la date exacte', async () => {
      // Configuration des mocks
      Mass.isCelebrantAvailable.mockResolvedValue(true);
      
      const params = {
        intention_text: 'Intention de test',
        deceased: true,
        dates: [testDate],
        mass_count: 1,
        celebrant_id: 1,
        date_type: 'imperative'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].date).toBe(testDate);
      expect(result[0].celebrant_id).toBe(1);
      expect(result[0].status).toBe('pending');
      expect(Mass.isCelebrantAvailable).toHaveBeenCalledWith(1, testDate);
    });
    
    test('Doit échouer si le célébrant n\'est pas disponible à la date exacte', async () => {
      // Configuration des mocks
      Mass.isCelebrantAvailable.mockResolvedValue(false);
      
      const params = {
        intention_text: 'Intention de test',
        deceased: true,
        dates: [testDate],
        mass_count: 1,
        celebrant_id: 1,
        date_type: 'imperative'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('error');
      expect(result[0].error).toBe('no_celebrant_available');
    });
  });
  
  describe('Scénario 2: Date impérative ET célébrant indifférent', () => {
    test('Doit trouver un célébrant disponible à cette date', async () => {
      // Configuration des mocks
      Mass.getRandomAvailableCelebrant.mockResolvedValue(mockCelebrant2);
      
      const params = {
        intention_text: 'Intention de test',
        deceased: false,
        dates: [testDate],
        mass_count: 1,
        celebrant_id: null,
        date_type: 'imperative'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].date).toBe(testDate);
      expect(result[0].celebrant_id).toBe(2);
      expect(result[0].status).toBe('pending');
    });
    
    test('Doit échouer si aucun célébrant n\'est disponible à cette date', async () => {
      // Configuration des mocks
      Mass.getRandomAvailableCelebrant.mockResolvedValue(null);
      
      const params = {
        intention_text: 'Intention de test',
        deceased: false,
        dates: [testDate],
        mass_count: 1,
        celebrant_id: null,
        date_type: 'imperative'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('error');
      expect(result[0].error).toBe('no_celebrant_available');
    });
  });
  
  describe('Scénario 3: Date souhaitée ET célébrant sélectionné', () => {
    test('Doit utiliser la date souhaitée si le célébrant est disponible', async () => {
      // Configuration des mocks
      Mass.isCelebrantAvailable.mockResolvedValue(true);
      
      const params = {
        intention_text: 'Intention de test',
        deceased: true,
        dates: [testDate],
        mass_count: 1,
        celebrant_id: 1,
        date_type: 'preferred'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].date).toBe(testDate);
      expect(result[0].celebrant_id).toBe(1);
      expect(result[0].status).toBe('pending');
      expect(result[0].changed_date).toBeUndefined();
    });
    
    test('Doit trouver une date alternative si le célébrant n\'est pas disponible', async () => {
      // Configuration des mocks
      Mass.isCelebrantAvailable.mockResolvedValue(false);
      Mass.findNextAvailableSlotForCelebrant.mockResolvedValue({
        date: new Date(nextDate),
        celebrant: mockCelebrant1
      });
      
      const params = {
        intention_text: 'Intention de test',
        deceased: true,
        dates: [testDate],
        mass_count: 1,
        celebrant_id: 1,
        date_type: 'preferred'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].original_date).toBe(testDate);
      expect(result[0].date).toBe(nextDate);
      expect(result[0].celebrant_id).toBe(1);
      expect(result[0].status).toBe('pending');
      expect(result[0].changed_date).toBe(true);
    });
  });
  
  describe('Scénario 4: Date souhaitée ET célébrant indifférent', () => {
    test('Doit trouver un célébrant disponible à la date souhaitée', async () => {
      // Configuration des mocks
      Mass.getRandomAvailableCelebrant.mockResolvedValue(mockCelebrant2);
      
      const params = {
        intention_text: 'Intention de test',
        deceased: false,
        dates: [testDate],
        mass_count: 1,
        celebrant_id: null,
        date_type: 'preferred'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].date).toBe(testDate);
      expect(result[0].celebrant_id).toBe(2);
      expect(result[0].status).toBe('pending');
    });
    
    test('Doit trouver une date alternative si aucun célébrant n\'est disponible', async () => {
      // Configuration des mocks
      Mass.getRandomAvailableCelebrant.mockResolvedValue(null);
      Mass.findNextAvailableSlot.mockResolvedValue({
        date: new Date(nextDate),
        celebrant: mockCelebrant2
      });
      
      const params = {
        intention_text: 'Intention de test',
        deceased: false,
        dates: [testDate],
        mass_count: 1,
        celebrant_id: null,
        date_type: 'preferred'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].original_date).toBe(testDate);
      expect(result[0].date).toBe(nextDate);
      expect(result[0].celebrant_id).toBe(2);
      expect(result[0].status).toBe('pending');
      expect(result[0].changed_date).toBe(true);
    });
  });
  
  describe('Scénario 5: Date indifférente ET célébrant sélectionné', () => {
    test('Doit trouver la première date disponible pour ce célébrant', async () => {
      // Configuration des mocks
      Mass.findNextAvailableSlotForCelebrant.mockResolvedValue({
        date: new Date(nextDate),
        celebrant: mockCelebrant1
      });
      
      const params = {
        intention_text: 'Intention de test',
        deceased: true,
        mass_count: 1,
        celebrant_id: 1,
        date_type: 'indifferent'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].date).toBe(nextDate);
      expect(result[0].celebrant_id).toBe(1);
      expect(result[0].status).toBe('pending');
    });
  });
  
  describe('Scénario 6: Date indifférente ET célébrant indifférent', () => {
    test('Doit optimiser la répartition de la charge', async () => {
      // Configuration des mocks
      Mass.findNextAvailableSlotForCelebrant.mockResolvedValue({
        date: new Date(nextDate),
        celebrant: mockCelebrant1
      });
      
      const params = {
        intention_text: 'Intention de test',
        deceased: false,
        mass_count: 1,
        celebrant_id: null,
        date_type: 'indifferent'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(1);
      expect(result[0].date).toBe(nextDate);
      expect(result[0].celebrant_id).toBe(1);
      expect(result[0].status).toBe('pending');
      expect(MassService.getLeastBusyCelebrant).toHaveBeenCalled();
    });
  });

  describe('Tests avec plusieurs messes', () => {
    test('Doit gérer plusieurs messes avec dates impératives', async () => {
      // Configuration des mocks
      Mass.isCelebrantAvailable.mockResolvedValue(true);
      
      const params = {
        intention_text: 'Série de messes',
        deceased: true,
        dates: [testDate, nextDate],
        mass_count: 2,
        celebrant_id: 1,
        date_type: 'imperative'
      };
      
      const result = await MassService.generateMassPreview(params);
      
      expect(result.length).toBe(2);
      expect(result[0].date).toBe(testDate);
      expect(result[1].date).toBe(nextDate);
      expect(Mass.isCelebrantAvailable).toHaveBeenCalledTimes(2);
    });
  });
});
