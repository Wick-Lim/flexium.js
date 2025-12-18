import { state, signal, effect } from 'flexium/core'
import { render } from 'flexium/dom'
import './style.css'
import {
  Button,
  IconButton,
  Transition,
  TransitionGroup,
  transitions,
  Row,
  Column,
  Stack,
  Grid,
  Spacer,
  List,
  Text,
  Pressable,
  ScrollView,
} from 'flexium/primitives'

// ==========================================
// Button Test Section
// ==========================================
function ButtonTests() {
  const [clickCount, setClickCount] = use(0)
  const [isLoading, setIsLoading] = use(false)
  const [isDisabled, setIsDisabled] = use(false)
  const [lastEvent, setLastEvent] = use('')

  const handleClick = () => {
    setClickCount((c) => c + 1)
    setLastEvent('click')
  }

  const handleAsyncClick = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    setLastEvent('async-complete')
  }

  return (
    <section id="button-tests" data-testid="button-section">
      <h2>Button Tests</h2>

      <div class="test-case" data-testid="basic-button">
        <h3>Basic Button</h3>
        <Button onPress={handleClick}>Click Me</Button>
        <span data-testid="click-count">Clicks: {clickCount}</span>
      </div>

      <div class="test-case" data-testid="button-variants">
        <h3>Button Variants</h3>
        <Row style={{ gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="primary" onPress={() => setLastEvent('primary')}>
            Primary
          </Button>
          <Button variant="secondary" onPress={() => setLastEvent('secondary')}>
            Secondary
          </Button>
          <Button variant="outline" onPress={() => setLastEvent('outline')}>
            Outline
          </Button>
          <Button variant="ghost" onPress={() => setLastEvent('ghost')}>
            Ghost
          </Button>
          <Button variant="danger" onPress={() => setLastEvent('danger')}>
            Danger
          </Button>
        </Row>
        <span data-testid="last-variant">{lastEvent}</span>
      </div>

      <div class="test-case" data-testid="button-sizes">
        <h3>Button Sizes</h3>
        <Row style={{ gap: '8px', alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
      </div>

      <div class="test-case" data-testid="button-loading">
        <h3>Loading State</h3>
        <Button
          loading={isLoading}
          loadingText="Processing..."
          onPress={handleAsyncClick}
        >
          Async Action
        </Button>
        <span data-testid="loading-state">{isLoading ? 'loading' : 'idle'}</span>
      </div>

      <div class="test-case" data-testid="button-disabled">
        <h3>Disabled State</h3>
        <Button disabled={isDisabled} onPress={() => setLastEvent('should-not-fire')}>
          {isDisabled ? 'Disabled' : 'Enabled'}
        </Button>
        <Button onPress={() => setIsDisabled((d) => !d)}>Toggle Disabled</Button>
      </div>

      <div class="test-case" data-testid="icon-button">
        <h3>Icon Button</h3>
        <IconButton
          icon={<span>X</span>}
          ariaLabel="Close"
          onPress={() => setLastEvent('icon-clicked')}
        />
        <span data-testid="icon-event">{lastEvent}</span>
      </div>

      <div class="test-case" data-testid="button-keyboard">
        <h3>Keyboard Accessibility</h3>
        <Button id="keyboard-test-btn" onPress={() => setLastEvent('keyboard')}>
          Press Enter or Space
        </Button>
        <span data-testid="keyboard-event">{lastEvent}</span>
      </div>
    </section>
  )
}

// ==========================================
// Transition Test Section
// ==========================================
function TransitionTests() {
  const [showFade, setShowFade] = use(true)
  const [showSlide, setShowSlide] = use(true)
  const [showModal, setShowModal] = use(false)
  const [showCustom, setShowCustom] = use(true)

  return (
    <section id="transition-tests" data-testid="transition-section">
      <h2>Transition Tests</h2>

      <div class="test-case" data-testid="fade-transition">
        <h3>Fade Transition</h3>
        <Button onPress={() => setShowFade((s) => !s)}>Toggle Fade</Button>
        <Transition show={showFade} {...transitions.fade}>
          <div class="transition-box" data-testid="fade-box">
            Fade Content
          </div>
        </Transition>
      </div>

      <div class="test-case" data-testid="slide-transition">
        <h3>Slide Up Transition</h3>
        <Button onPress={() => setShowSlide((s) => !s)}>Toggle Slide</Button>
        <Transition show={showSlide} {...transitions.slideUp}>
          <div class="transition-box" data-testid="slide-box">
            Slide Content
          </div>
        </Transition>
      </div>

      <div class="test-case" data-testid="modal-transition">
        <h3>Modal Transition</h3>
        <Button onPress={() => setShowModal(true)}>Open Modal</Button>
        <Transition show={showModal} {...transitions.modal}>
          <div class="modal-overlay" data-testid="modal-box">
            <div class="modal-content">
              <h4>Modal Title</h4>
              <p>Modal content here</p>
              <Button onPress={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        </Transition>
      </div>

      <div class="test-case" data-testid="custom-transition">
        <h3>Custom Transition</h3>
        <Button onPress={() => setShowCustom((s) => !s)}>Toggle Custom</Button>
        <Transition
          show={showCustom}
          enter={{ opacity: 0, x: -50, rotate: -10 }}
          enterTo={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: 50, rotate: 10 }}
          enterTiming={{ duration: 300, easing: 'ease-out' }}
          exitTiming={{ duration: 200, easing: 'ease-in' }}
        >
          <div class="transition-box" data-testid="custom-box">
            Custom Animation
          </div>
        </Transition>
      </div>
    </section>
  )
}

// ==========================================
// TransitionGroup Test Section
// ==========================================
function TransitionGroupTests() {
  const [items, setItems] = use([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ])
  const [nextId, setNextId] = use(4)

  const addItem = () => {
    setItems((prev) => [...prev, { id: nextId, text: `Item ${nextId}` }])
    setNextId((id) => id + 1)
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const shuffleItems = () => {
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5))
  }

  return (
    <section id="transition-group-tests" data-testid="transition-group-section">
      <h2>TransitionGroup Tests</h2>

      <div class="test-case">
        <Row style={{ gap: '8px' }}>
          <Button onPress={addItem}>Add Item</Button>
          <Button onPress={shuffleItems}>Shuffle</Button>
        </Row>

        <TransitionGroup>
          {items.map((item) => (
            <Transition key={item.id} {...transitions.slideUp}>
              <div class="list-item" data-testid={`group-item-${item.id}`}>
                {item.text}
                <Button size="sm" variant="ghost" onPress={() => removeItem(item.id)}>
                  Remove
                </Button>
              </div>
            </Transition>
          ))}
        </TransitionGroup>

        <span data-testid="item-count">Count: {items.length}</span>
      </div>
    </section>
  )
}

// ==========================================
// Layout Test Section
// ==========================================
function LayoutTests() {
  return (
    <section id="layout-tests" data-testid="layout-section">
      <h2>Layout Tests</h2>

      <div class="test-case" data-testid="row-layout">
        <h3>Row</h3>
        <Row style={{ gap: '8px', background: '#f0f0f0', padding: '8px' }}>
          <div class="layout-box">1</div>
          <div class="layout-box">2</div>
          <div class="layout-box">3</div>
        </Row>
      </div>

      <div class="test-case" data-testid="column-layout">
        <h3>Column</h3>
        <Column style={{ gap: '8px', background: '#f0f0f0', padding: '8px' }}>
          <div class="layout-box">1</div>
          <div class="layout-box">2</div>
          <div class="layout-box">3</div>
        </Column>
      </div>

      <div class="test-case" data-testid="stack-layout">
        <h3>Stack (Overlapping)</h3>
        <Stack style={{ width: '200px', height: '100px' }}>
          <div class="stack-item" style={{ background: 'red', opacity: '0.5' }}>
            Layer 1
          </div>
          <div class="stack-item" style={{ background: 'blue', opacity: '0.5' }}>
            Layer 2
          </div>
        </Stack>
      </div>

      <div class="test-case" data-testid="grid-layout">
        <h3>Grid</h3>
        <Grid columns={3} gap="8px" style={{ background: '#f0f0f0', padding: '8px' }}>
          <div class="layout-box">1</div>
          <div class="layout-box">2</div>
          <div class="layout-box">3</div>
          <div class="layout-box">4</div>
          <div class="layout-box">5</div>
          <div class="layout-box">6</div>
        </Grid>
      </div>

      <div class="test-case" data-testid="spacer-layout">
        <h3>Spacer</h3>
        <Row style={{ background: '#f0f0f0', padding: '8px' }}>
          <div class="layout-box">Left</div>
          <Spacer />
          <div class="layout-box">Right</div>
        </Row>
      </div>
    </section>
  )
}

// ==========================================
// List Test Section
// ==========================================
function ListTests() {
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `List Item ${i + 1}`,
  }))

  const [selectedId, setSelectedId] = state<number | null>(null)

  return (
    <section id="list-tests" data-testid="list-section">
      <h2>List Tests</h2>

      <div class="test-case" data-testid="basic-list">
        <h3>Basic List</h3>
        <div style={{ height: '200px', overflow: 'auto', border: '1px solid #ccc' }}>
          <List
            data={items}
            renderItem={(item) => (
              <div
                class={`list-row ${selectedId === item.id ? 'selected' : ''}`}
                data-testid={`list-item-${item.id}`}
                onclick={() => setSelectedId(item.id)}
              >
                {item.text}
              </div>
            )}
            keyExtractor={(item) => item.id}
          />
        </div>
        <span data-testid="selected-id">Selected: {selectedId ?? 'none'}</span>
      </div>

      <div class="test-case" data-testid="virtualized-list">
        <h3>Virtualized List (1000 items)</h3>
        <div style={{ height: '300px', overflow: 'auto', border: '1px solid #ccc' }}>
          <List
            data={Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Row ${i}` }))}
            renderItem={(item) => (
              <div class="list-row" data-testid={`virtual-item-${item.id}`}>
                {item.text}
              </div>
            )}
            keyExtractor={(item) => item.id}
            virtualized={{ itemHeight: 40 }}
          />
        </div>
      </div>
    </section>
  )
}

// ==========================================
// Pressable Test Section
// ==========================================
function PressableTests() {
  const [pressState, setPressState] = use('idle')
  const [pressCount, setPressCount] = use(0)

  return (
    <section id="pressable-tests" data-testid="pressable-section">
      <h2>Pressable Tests</h2>

      <div class="test-case" data-testid="basic-pressable">
        <h3>Basic Pressable</h3>
        <Pressable
          onPress={() => {
            setPressCount((c) => c + 1)
            setPressState('pressed')
          }}
          onPressIn={() => setPressState('pressing')}
          onPressOut={() => setPressState('released')}
          style={{
            padding: '16px',
            background: '#e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <span>Press Me</span>
        </Pressable>
        <span data-testid="press-state">State: {pressState}</span>
        <span data-testid="press-count">Count: {pressCount}</span>
      </div>

      <div class="test-case" data-testid="pressable-feedback">
        <h3>Pressable with Visual Feedback</h3>
        <Pressable
          onPress={() => setPressState('feedback-pressed')}
          style={{
            padding: '16px',
            background: pressState === 'feedback-pressing' ? '#ccc' : '#e0e0e0',
            borderRadius: '8px',
            transform: pressState === 'feedback-pressing' ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.1s, background 0.1s',
          }}
        >
          <span>Press with Feedback</span>
        </Pressable>
      </div>
    </section>
  )
}

// ==========================================
// Text Test Section
// ==========================================
function TextTests() {
  return (
    <section id="text-tests" data-testid="text-section">
      <h2>Text Tests</h2>

      <div class="test-case" data-testid="text-styles">
        <h3>Text Styles</h3>
        <Column style={{ gap: '8px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>Heading Text</Text>
          <Text style={{ fontSize: '16px' }}>Body Text</Text>
          <Text style={{ fontSize: '12px', color: '#666' }}>Caption Text</Text>
          <Text style={{ fontStyle: 'italic' }}>Italic Text</Text>
          <Text style={{ textDecoration: 'underline' }}>Underlined Text</Text>
        </Column>
      </div>

      <div class="test-case" data-testid="text-truncation">
        <h3>Text Truncation</h3>
        <div style={{ width: '200px' }}>
          <Text
            numberOfLines={1}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            This is a very long text that should be truncated with ellipsis
          </Text>
        </div>
      </div>
    </section>
  )
}

// ==========================================
// ScrollView Test Section
// ==========================================
function ScrollViewTests() {
  const [scrollY, setScrollY] = use(0)

  return (
    <section id="scrollview-tests" data-testid="scrollview-section">
      <h2>ScrollView Tests</h2>

      <div class="test-case" data-testid="vertical-scroll">
        <h3>Vertical ScrollView</h3>
        <ScrollView
          style={{ height: '150px', border: '1px solid #ccc' }}
          onScroll={(e) => setScrollY((e.target as HTMLElement).scrollTop)}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <div class="scroll-item" key={i}>
              Scroll Item {i + 1}
            </div>
          ))}
        </ScrollView>
        <span data-testid="scroll-position">Scroll Y: {Math.round(scrollY)}</span>
      </div>

      <div class="test-case" data-testid="horizontal-scroll">
        <h3>Horizontal ScrollView</h3>
        <ScrollView horizontal style={{ width: '300px', border: '1px solid #ccc' }}>
          <Row style={{ gap: '8px' }}>
            {Array.from({ length: 20 }, (_, i) => (
              <div class="scroll-item-h" key={i}>
                Item {i + 1}
              </div>
            ))}
          </Row>
        </ScrollView>
      </div>
    </section>
  )
}

// ==========================================
// Main App
// ==========================================
function App() {
  return (
    <div class="app">
      <header>
        <h1>Flexium Primitives Test Suite</h1>
        <p>E2E testing for all primitive components</p>
      </header>

      <nav>
        <a href="#button-tests">Button</a>
        <a href="#transition-tests">Transition</a>
        <a href="#transition-group-tests">TransitionGroup</a>
        <a href="#layout-tests">Layout</a>
        <a href="#list-tests">List</a>
        <a href="#pressable-tests">Pressable</a>
        <a href="#text-tests">Text</a>
        <a href="#scrollview-tests">ScrollView</a>
      </nav>

      <main>
        <ButtonTests />
        <TransitionTests />
        <TransitionGroupTests />
        <LayoutTests />
        <ListTests />
        <PressableTests />
        <TextTests />
        <ScrollViewTests />
      </main>
    </div>
  )
}

render(<App />, document.getElementById('app')!)
